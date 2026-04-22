try {
  importScripts("/assets/wasm/simc.js");
} catch (err) {
  self.postMessage({
    type: "error",
    message: `Failed to load simc.js: ${err && err.message ? err.message : String(err)}`,
  });
  throw err;
}

const BLOCKED_OPTIONS = [
  "output", "html", "json", "json2",
  "log_file",
  "save_profiles", "save_profile_with_actions", "save_full_profile",
  "save_raid_summary", "save_prefix", "save_suffix",
  "input",
];
const BLOCKED_RE = new RegExp(
  `^\\s*(${BLOCKED_OPTIONS.join("|")})\\s*=`, "i"
);

function sanitizeConfig(raw) {
  const lines = raw.split("\n");
  const cleaned = [];
  for (const line of lines) {
    if (BLOCKED_RE.test(line)) {
      const key = line.match(BLOCKED_RE)[1];
      return { error: `Blocked option in config: "${key}"` };
    }
    cleaned.push(line);
  }
  return { config: cleaned.join("\n") };
}

function parseProgress(parts) {
  if (parts.length < 7) return null;

  let i = 1;
  if (isNaN(parseInt(parts[1], 10))) {
    i = 2;
  }
  if (parts.length < i + 6) return null;

  const currentIter = parseInt(parts[i + 2], 10);
  const totalIter = parseInt(parts[i + 3], 10);
  if (isNaN(currentIter) || isNaN(totalIter)) return null;

  const progress = {
    type: "progress",
    phase: parts[0] || "",
    currentPhase: parseInt(parts[i], 10) || 0,
    totalPhases: parseInt(parts[i + 1], 10) || 0,
    currentIter,
    totalIter,
    iterPerSec: parseFloat(parts[i + 4]) || 0,
    remaining: "",
  };

  const rest = parts.slice(i + 5);
  if (rest.length >= 3) {
    progress.mean = parseFloat(rest[0]) || 0;
    progress.error = parseFloat(rest[1]) || 0;
    progress.remaining = rest[2] || "";
  } else if (rest.length >= 1) {
    progress.remaining = rest[0] || "";
  }

  return progress;
}

function extractResult(json) {
  const sim = json.sim || {};
  const players = sim.players || [];
  const player = players[0] || {};
  const stats = player.collected_data || {};
  const specFull = player.specialization || "";
  const specParts = specFull.split(" ");
  const className = specParts.length > 1 ? specParts.slice(1).join(" ") : "";
  const spec = specParts[0] || "";

  return {
    dps: stats.dps?.mean || 0,
    dpsMin: stats.dps?.min || 0,
    dpsMax: stats.dps?.max || 0,
    dpsMedian: stats.dps?.median || 0,
    dpse: stats.dpse?.mean || 0,
    playerName: player.name || "Unknown",
    race: player.race || "Unknown",
    spec,
    className,
    level: player.level || 0,
    iterations: sim.options?.iterations || 0,
    targetError: sim.options?.target_error || 0,
    fightLength: sim.options?.max_time || 0,
    raidDps: sim.statistics?.raid_dps?.mean || 0,
  };
}

const simcErrors = [];

function onStdout(line) {
  if (!line) return;
  if (/^Error:/i.test(line)) simcErrors.push(line);
  const parts = line.split("\t");
  const parsed = parseProgress(parts);
  if (parsed) {
    self.postMessage(parsed);
  } else {
    self.postMessage({ type: "log", message: line });
  }
}

function formatErr(err) {
  if (!err) return "unknown error";
  if (err.message) return err.message;
  if (err.code && err.errno !== undefined) return `${err.code} (errno ${err.errno})`;
  return String(err);
}

self.postMessage({ type: "loading" });

const modulePromise = createSimcModule({
  noInitialRun: true,
  print: onStdout,
  printErr: onStdout,
  locateFile: (p) => `/assets/wasm/${p}`,
  mainScriptUrlOrBlob: "/assets/wasm/simc.js",
}).then((m) => {
  self.postMessage({ type: "ready" });
  return m;
}).catch((err) => {
  self.postMessage({
    type: "error",
    message: `Failed to initialize simc: ${err && err.message ? err.message : String(err)}`,
  });
  throw err;
});

self.onmessage = async (e) => {
  const msg = e.data;
  if (!msg || msg.type !== "simulate") return;

  const sanitized = sanitizeConfig(msg.config || "");
  if (sanitized.error) {
    self.postMessage({ type: "error", message: sanitized.error });
    return;
  }

  let m;
  try {
    m = await modulePromise;
  } catch {
    return;
  }

  const threads =
    (self.navigator && self.navigator.hardwareConcurrency) || 4;

  try { m.FS.mkdir("/work"); } catch {}
  try { m.FS.unlink("/work/out.json"); } catch {}
  m.FS.writeFile("/work/input.simc", sanitized.config);

  self.postMessage({ type: "started", threads });

  const args = [
    "/work/input.simc",
    "json=/work/out.json",
    `threads=${threads}`,
    "progressbar_type=1",
  ];
  if (msg.fightStyle) {
    args.push(`fight_style=${msg.fightStyle}`);
  }

  simcErrors.length = 0;

  try {
    m.callMain(args);
  } catch (err) {
    const prefix = simcErrors.length ? simcErrors.join("\n") : `simc exited: ${formatErr(err)}`;
    self.postMessage({ type: "error", message: prefix });
    return;
  }

  try {
    const jsonText = m.FS.readFile("/work/out.json", { encoding: "utf8" });
    const data = extractResult(JSON.parse(jsonText));
    self.postMessage({ type: "result", data });
  } catch (err) {
    const detail = simcErrors.length
      ? simcErrors.join("\n")
      : `Failed to parse results: ${formatErr(err)}`;
    self.postMessage({ type: "error", message: detail });
  }
};
