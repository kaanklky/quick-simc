const express = require("express");
const { WebSocketServer } = require("ws");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const http = require("http");
const os = require("os");

const PORT = process.env.PORT || 3000;
const SIMC_BIN = process.env.SIMC_BIN || path.resolve(__dirname, "bin/simc");
const TMP_DIR = path.resolve(__dirname, "tmp");
const THREADS = Math.min(os.cpus().length, 8);
const ACCESS_CODE = process.env.WEB_ACCESS_CODE || "";

const VALID_FIGHT_STYLES = [
  "Patchwerk",
  "CastingPatchwerk",
  "HecticAddCleave",
  "DungeonSlice",
  "DungeonRoute",
  "CleaveAdd",
  "LightMovement",
  "HeavyMovement",
];

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const activeSessions = new Set();

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const pair of header.split(";")) {
    const [key, ...rest] = pair.split("=");
    cookies[key.trim()] = rest.join("=").trim();
  }
  return cookies;
}

function isAuthenticated(req) {
  if (!ACCESS_CODE) return true;
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["simc_token"];
  return token && activeSessions.has(token);
}

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Quick SimC</title>
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Inter",-apple-system,BlinkMacSystemFont,sans-serif;background:#08080f;color:#e8e6f0;min-height:100vh;display:flex;align-items:center;justify-content:center}
.box{background:#0e0e1a;border:1px solid #2a2a45;border-radius:12px;padding:32px;width:100%;max-width:360px;text-align:center}
h1{font-size:1.4rem;font-weight:600;margin-bottom:4px}
.sub{font-size:.73rem;color:#6b6980;margin-bottom:24px}
.form{display:flex;gap:8px}
input{flex:1;background:#141425;color:#e8e6f0;border:1px solid #2a2a45;border-radius:8px;padding:8px 14px;font-size:.85rem;outline:none;font-family:inherit}
input:focus{border-color:#7b5ea7}
button{background:#7b5ea7;color:#fff;border:none;border-radius:8px;padding:8px 20px;font-size:.85rem;font-weight:500;cursor:pointer;font-family:inherit}
button:hover{background:#9b7ec8}
.err{margin-top:12px;font-size:.78rem;color:#c44040;display:none}
</style>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
<div class="box">
<h1>Quick SimC</h1>
<p class="sub">Enter access code to continue</p>
<form class="form" method="POST" action="/login">
<input type="password" name="code" placeholder="Access code" autocomplete="off" autofocus>
<button type="submit">Enter</button>
</form>
<p class="err" id="err">Invalid access code</p>
</div>
<script>
if(location.search.includes("invalid"))document.getElementById("err").style.display="block";
</script>
</body>
</html>`;

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/login", (_req, res) => {
  if (!ACCESS_CODE) return res.redirect("/");
  res.type("html").send(LOGIN_HTML);
});

app.post("/login", (req, res) => {
  if (!ACCESS_CODE) return res.redirect("/");
  const codeStr = String(req.body.code || "");
  const codeHash = crypto.createHash("sha256").update(codeStr).digest();
  const expectedHash = crypto.createHash("sha256").update(ACCESS_CODE).digest();
  if (codeStr && crypto.timingSafeEqual(codeHash, expectedHash)) {
    const token = generateToken();
    activeSessions.add(token);
    res.cookie("simc_token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect("/");
  }
  res.redirect("/login?invalid");
});

app.use((req, res, next) => {
  if (!ACCESS_CODE) return next();
  if (isAuthenticated(req)) return next();
  res.redirect("/login");
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/fight-styles", (_req, res) => {
  res.json(VALID_FIGHT_STYLES);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  let activeProcess = null;
  let activeFiles = [];

  if (ACCESS_CODE && !isAuthenticated(req)) {
    ws.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
    ws.close();
    return;
  }

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    if (msg.type === "simulate") {
      if (activeProcess) {
        activeProcess.kill("SIGTERM");
        activeProcess = null;
      }
      cleanup(...activeFiles);

      const id = crypto.randomUUID();
      const simcFile = path.join(TMP_DIR, `${id}.simc`);
      const jsonFile = path.join(TMP_DIR, `${id}.json`);
      activeFiles = [simcFile, jsonFile];

      const sanitized = sanitizeConfig(msg.config);
      if (sanitized.error) {
        ws.send(JSON.stringify({ type: "error", message: sanitized.error }));
        cleanup(...activeFiles);
        activeFiles = [];
        return;
      }
      fs.writeFileSync(simcFile, sanitized.config, "utf-8");

      const args = [
        simcFile,
        `json=${jsonFile}`,
        `threads=${THREADS}`,
        "progressbar_type=1",
      ];

      const fightStyle = msg.fightStyle || "";
      if (fightStyle && VALID_FIGHT_STYLES.includes(fightStyle)) {
        args.push(`fight_style=${fightStyle}`);
      }

      const proc = spawn(SIMC_BIN, args);
      activeProcess = proc;

      ws.send(JSON.stringify({ type: "started", id, threads: THREADS }));

      let stdoutBuffer = "";
      proc.stdout.on("data", (chunk) => {
        stdoutBuffer += chunk.toString();
        const lines = stdoutBuffer.split("\n");
        stdoutBuffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          const parts = line.split("\t");
          const parsed = parseProgress(parts);
          if (parsed) {
            ws.send(JSON.stringify(parsed));
          } else {
            ws.send(JSON.stringify({ type: "log", message: line }));
          }
        }
      });

      let stderrData = "";
      proc.stderr.on("data", (chunk) => {
        stderrData += chunk.toString();
      });

      proc.on("close", (code) => {
        activeProcess = null;

        if (code !== 0) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: stderrData || `simc exited with code ${code}`,
            })
          );
          cleanup(...activeFiles);
          activeFiles = [];
          return;
        }

        try {
          const jsonData = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
          const result = extractResult(jsonData);
          ws.send(JSON.stringify({ type: "result", data: result }));
        } catch (err) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Failed to parse results: ${err.message}`,
            })
          );
        }

        cleanup(simcFile, jsonFile);
      });

      proc.on("error", (err) => {
        activeProcess = null;
        ws.send(
          JSON.stringify({
            type: "error",
            message: `Failed to start simc: ${err.message}`,
          })
        );
        cleanup(simcFile, jsonFile);
      });
    }

    if (msg.type === "cancel") {
      if (activeProcess) {
        activeProcess.kill("SIGTERM");
        activeProcess = null;
        ws.send(JSON.stringify({ type: "cancelled" }));
      }
    }
  });

  ws.on("close", () => {
    if (activeProcess) {
      activeProcess.kill("SIGTERM");
      activeProcess = null;
    }
    cleanup(...activeFiles);
    activeFiles = [];
  });
});

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

function cleanup(...files) {
  for (const file of files) {
    try {
      fs.unlinkSync(file);
    } catch {}
  }
}

server.listen(PORT, () => {
  console.log(`Quick SimC running at http://localhost:${PORT}`);
});
