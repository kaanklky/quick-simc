const EXAMPLE_PROFILE = `# Sozinn - Marksmanship - 2026-06-12 00:36 - EU/Twisting Nether
# SimC Addon 12.0.5-04
# WoW 12.0.5.67823, TOC 120005
# Requires SimulationCraft 1000-01 or newer

hunter="Sozinn"
level=90
race=blood_elf
region=eu
server=twisting_nether
role=attack
professions=herbalism=92/mining=100
spec=marksmanship
# loot_spec=marksmanship

talents=C4PApei1JmYNvFfEFaN5bWuGKYzsMwAmgZYLwsAAAAAAAAAMjZMDzYmZMDGTzYmZstxYmlZmZmZmlhZZwAAAMmZmZmZGAYWMAbMDA

# Saved Loadout: iv-Single-DR-12.0.5-01
# talents=C4PApei1JmYNvFfEFaN5bWuGKYzsMwAGwMsBMLAAAAAAAAAzYGzwMmZGzgxYGzMjtNGzsMzMzMzsMmZZwAAAMmZmZmZGA2gBYjZA
# Saved Loadout: iv-Single-DR-12.0.5-02
# talents=C4PApei1JmYNvFfEFaN5bWuGKYzsMwAGwMsBMLAAAAAAAAAzYGzwMmZGzgxYGzMjtNGzsMzMzMzsMMLDGAAgxMzMzMzAAziBYjZA
# Saved Loadout: iv-AoE-DR-12.0.5-01
# talents=C4PApei1JmYNvFfEFaN5bWuGKYzsMwAGwMsBMLAAAAAAAAAzYmZGbGzMjZYZMmxgZZjZmZZmZmZmZhZWGmZAAAmxYmZmBMAGgNmB
# Saved Loadout: iv-AoE-DR-12.0.5-02
# talents=C4PApei1JmYNvFfEFaN5bWuGKYzsMwAGwMsAMLAAAAAAAAAzYmZGbGzMjZYZMmxgZZzMzwMzYmZWYmlhZGAAgZMmZmZADgBYjZGD

# Primal Sentry's Maw (289)
head=,id=249988,bonus_id=6652/12667/13440/13338/13575/12806
# Masterwork Sin'dorei Amulet (285)
neck=,id=240950,bonus_id=12214/13667/12497/12066/8791/13622,crafted_stats=32/49,crafting_quality=5
# Spaulders of Arrow's Flight (289)
shoulder=,id=251097,enchant_id=8001,bonus_id=13440/43/13577/12699/12806
# Cloak of the Fallen Cardinal (289)
back=,id=49823,bonus_id=13440/6652/13577/12699/12806
# Primal Sentry's Scaleplate (289)
chest=,id=249991,enchant_id=7987,bonus_id=6652/13335/13336/13575/12806
# Tabard of Summer Flames (1)
tabard=,id=35280
# Farstrider's Plated Bracers (285)
wrist=,id=244584,bonus_id=12214/13667/12497/12066/8791/13622/12667,crafted_stats=40/36,crafting_quality=5
# Primal Sentry's Talonguards (289)
hands=,id=249989,enchant_id=2841,bonus_id=6652/13440/13337/13574/12806
# World Tender's Barkclasp (285)
waist=,id=244611,bonus_id=12214/13667/8960/12497/12066/12667/13622,crafting_quality=5
# Primal Sentry's Legguards (289)
legs=,id=249987,enchant_id=8159,bonus_id=6652/13440/13339/13575/12806
# World Tender's Rootslippers (285)
feet=,id=244610,enchant_id=7993,bonus_id=12214/13667/8960/12497/12066/13622,crafting_quality=5
# Occlusion of Void (276)
finger1=,id=251217,bonus_id=13440/6652/13668/12699/12798
# Platinum Star Band (276)
finger2=,id=193708,bonus_id=13440/6652/13668/12699/12798
# Algeth'ar Puzzle Box (298)
trinket1=,id=193701,bonus_id=13440/6652/12699/13654
# Emberwing Feather (289)
trinket2=,id=250144,bonus_id=13440/6652/12699/12806
# Aln'hara Sprigshot (295)
main_hand=,id=265337,bonus_id=12214/13655/12497/12066/8791/13622,crafted_stats=36/32,crafting_quality=5

### Gear from Bags
#
# Sharpeye Gleam (266)
# head=,id=258585,bonus_id=12795/13440/6652/12667/13577/12699
#
# Pauldrons of the Void Hunter (266)
# shoulder=,id=151323,bonus_id=12795/13440/6652/13577/12699
#
# Heart of Wind (266)
# trinket1=,id=250256,bonus_id=12795/13440/6652/12699

### Additional Character Info
#
# catalyst_currencies=3269:8/3378:8/2813:8/3116:8
#
# upgrade_currencies=c:3347:17/c:3383:27/c:3341:6/c:3343:29/c:3345:6/i:228338:1/i:230906:7/i:228339:1/i:224072:1/i:268552:8/i:231756:7/i:232875:3/i:229390:9/i:230936:1/i:231769:1/i:211296:11
#
# slot_high_watermarks=0:289:289/1:285:285/2:289:289/3:289:289/4:285:285/5:289:289/6:285:285/7:285:285/8:289:289/9:276:276/10:289:289/11:289:289/12:295:295/13:0:67/14:0:67/15:0:67/16:0:67
#
# upgrade_achievements=40107/40942/40943/40944/41886/41887/41888/41892/42767/42768/42769/61809/42770

# Checksum: 8d84ff41`;

const STORAGE_KEY = "quick-simc-config";

const FIGHT_STYLES = [
  "Patchwerk",
  "CastingPatchwerk",
  "HecticAddCleave",
  "DungeonSlice",
  "DungeonRoute",
  "CleaveAdd",
  "LightMovement",
  "HeavyMovement",
];

const KNOWN_CLASSES = [
  "warrior", "paladin", "hunter", "rogue", "priest",
  "deathknight", "shaman", "mage", "warlock", "monk",
  "druid", "demonhunter", "evoker",
];

const CLASS_DISPLAY = {
  warrior: "Warrior",
  paladin: "Paladin",
  hunter: "Hunter",
  rogue: "Rogue",
  priest: "Priest",
  deathknight: "Death Knight",
  shaman: "Shaman",
  mage: "Mage",
  warlock: "Warlock",
  monk: "Monk",
  druid: "Druid",
  demonhunter: "Demon Hunter",
  evoker: "Evoker",
};

const RACE_DISPLAY = {
  blood_elf: "Blood Elf",
  human: "Human",
  dwarf: "Dwarf",
  night_elf: "Night Elf",
  gnome: "Gnome",
  draenei: "Draenei",
  worgen: "Worgen",
  orc: "Orc",
  undead: "Undead",
  tauren: "Tauren",
  troll: "Troll",
  goblin: "Goblin",
  pandaren: "Pandaren",
  void_elf: "Void Elf",
  lightforged_draenei: "Lightforged Draenei",
  dark_iron_dwarf: "Dark Iron Dwarf",
  kul_tiran: "Kul Tiran",
  mechagnome: "Mechagnome",
  nightborne: "Nightborne",
  highmountain_tauren: "Highmountain Tauren",
  maghar_orc: "Mag'har Orc",
  zandalari_troll: "Zandalari Troll",
  vulpera: "Vulpera",
  dracthyr: "Dracthyr",
  earthen: "Earthen",
};

function parseConfig(config) {
  const lines = config.split("\n");
  const result = { name: "", race: "", server: "", spec: "", className: "", region: "" };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) continue;

    for (const cls of KNOWN_CLASSES) {
      const match = trimmed.match(new RegExp(`^${cls}="?([^"\\n]+)"?`));
      if (match) {
        result.name = match[1];
        result.className = cls;
        break;
      }
    }

    const kvMatch = trimmed.match(/^(\w+)=(.+)/);
    if (kvMatch) {
      const [, key, val] = kvMatch;
      if (key === "race") result.race = val.trim();
      if (key === "server") result.server = val.trim();
      if (key === "spec") result.spec = val.trim();
      if (key === "region") result.region = val.trim().toUpperCase();
    }
  }

  return result;
}

function formatNumber(n) {
  return Math.round(n).toLocaleString("en-US");
}

function formatCompact(n) {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n < 1000000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1000000).toFixed(1)}M`;
}

function formatEta(raw) {
  const sec = parseFloat(raw);
  if (isNaN(sec)) return raw;
  if (sec < 1) return "< 1s";
  if (sec < 60) return `${Math.round(sec)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

function formatServer(server) {
  return server.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const $ = (sel) => document.querySelector(sel);

const els = {
  input: $("#simc-input"),
  fightStyle: $("#fight-style"),
  btnSimulate: $("#btn-simulate"),
  btnClear: $("#btn-clear"),
  btnCancel: $("#btn-cancel"),
  progressSection: $("#progress-section"),
  progressBar: $("#progress-bar"),
  progressPhase: $("#progress-phase"),
  progressIter: $("#progress-iter"),
  progressSpeed: $("#progress-speed"),
  progressEta: $("#progress-eta"),
  resultSection: $("#result-section"),
  resultTitle: $("#result-title"),
  resultName: $("#result-name"),
  resultRaceClass: $("#result-race-class"),
  resultSpec: $("#result-spec"),
  resultRealm: $("#result-realm"),
  resultDps: $("#result-dps"),
  resultDpsMin: $("#result-dps-min"),
  resultDpsMax: $("#result-dps-max"),
  resultDpsMedian: $("#result-dps-median"),
  resultIterations: $("#result-iterations"),
  resultFightLength: $("#result-fight-length"),
  resultError: $("#result-error"),
  errorSection: $("#error-section"),
  errorMessage: $("#error-message"),
  logSection: $("#log-section"),
  logOutput: $("#log-output"),
  btnToggleLog: $("#btn-toggle-log"),
};

let worker = null;
let logMessages = [];
let maxTotalIter = 0;
let simThreads = 1;
let simStartTime = 0;

function loadFightStyles() {
  for (const style of FIGHT_STYLES) {
    const opt = document.createElement("option");
    opt.value = style;
    opt.textContent = style;
    els.fightStyle.appendChild(opt);
  }
}

function saveConfig() {
  try {
    localStorage.setItem(STORAGE_KEY, els.input.value);
  } catch {}
}

function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      els.input.value = saved;
      return;
    }
  } catch {}
  els.input.value = EXAMPLE_PROFILE;
}

function resetProgress() {
  els.progressBar.style.width = "0%";
  els.progressPhase.textContent = "";
  els.progressIter.textContent = "";
  els.progressSpeed.textContent = "";
  els.progressEta.textContent = "";
  maxTotalIter = 0;
  simThreads = 1;
  logMessages = [];
  els.logOutput.textContent = "";
  els.logSection.classList.add("hidden");
  els.logOutput.classList.add("hidden");
  els.btnToggleLog.textContent = "Show";
}

function spawnWorker() {
  if (worker) {
    try { worker.terminate(); } catch {}
    worker = null;
  }
  els.btnSimulate.disabled = true;
  els.btnSimulate.textContent = "Loading simc...";
  worker = new Worker("/assets/js/sim-worker.js");
  worker.onmessage = (event) => handleMessage(event.data);
  worker.onerror = (err) => {
    handleMessage({
      type: "error",
      message: err.message || "Worker error",
    });
  };
}

function terminateAndRespawn() {
  if (worker) {
    try { worker.terminate(); } catch {}
    worker = null;
  }
  spawnWorker();
}

function handleMessage(msg) {
  switch (msg.type) {
    case "loading":
      els.btnSimulate.disabled = true;
      els.btnSimulate.textContent = "Loading simc...";
      break;

    case "ready":
      els.btnSimulate.disabled = false;
      els.btnSimulate.textContent = "Simulate";
      break;

    case "started":
      resetProgress();
      simThreads = msg.threads || 1;
      simStartTime = Date.now();
      els.progressSection.classList.remove("hidden");
      els.resultSection.classList.add("hidden");
      els.errorSection.classList.add("hidden");
      els.progressIter.textContent = "Initializing...";
      break;

    case "progress":
      updateProgress(msg);
      break;

    case "log":
      logMessages.push(msg.message);
      els.logSection.classList.remove("hidden");
      els.logOutput.textContent = logMessages.join("\n");
      els.logOutput.scrollTop = els.logOutput.scrollHeight;
      break;

    case "result":
      showResult(msg.data);
      terminateAndRespawn();
      break;

    case "error":
      els.progressSection.classList.add("hidden");
      els.errorSection.classList.remove("hidden");
      els.errorMessage.textContent = msg.message;
      terminateAndRespawn();
      break;

    case "cancelled":
      els.progressSection.classList.add("hidden");
      terminateAndRespawn();
      break;
  }
}

function updateProgress(data) {
  if (data.totalIter > maxTotalIter) {
    maxTotalIter = data.totalIter;
  }

  let pct = 0;
  if (maxTotalIter > 0) {
    pct = (data.currentIter / maxTotalIter) * 100;
  }
  els.progressBar.style.width = `${Math.min(pct, 100)}%`;

  if (data.totalPhases > 1) {
    els.progressPhase.textContent = `Phase ${data.currentPhase}/${data.totalPhases}`;
  } else {
    els.progressPhase.textContent = "";
  }

  els.progressIter.textContent = `${formatCompact(data.currentIter)} / ${formatCompact(maxTotalIter)} iterations`;
  const speed = Math.round(data.iterPerSec * simThreads);
  els.progressSpeed.textContent = `${formatCompact(speed)} iter/s`;

  if (data.remaining) {
    els.progressEta.textContent = `ETA: ${formatEta(data.remaining)}`;
  } else {
    els.progressEta.textContent = "";
  }
}

function showResult(data) {
  els.progressSection.classList.add("hidden");
  els.resultSection.classList.remove("hidden");

  if (simStartTime > 0) {
    const elapsedSec = (Date.now() - simStartTime) / 1000;
    els.resultTitle.textContent = `Results - took ${formatEta(elapsedSec)}`;
  } else {
    els.resultTitle.textContent = "Results";
  }

  const config = parseConfig(els.input.value);

  els.resultName.textContent = config.name || data.playerName;

  const raceDisplay = RACE_DISPLAY[config.race] || capitalize(config.race || data.race);
  const classDisplay = CLASS_DISPLAY[config.className] || capitalize(config.className || data.className);
  els.resultRaceClass.textContent = `${raceDisplay} ${classDisplay}`;

  els.resultSpec.textContent = capitalize(config.spec || data.spec);

  const serverDisplay = formatServer(config.server);
  const realm = config.region ? `${config.region} - ${serverDisplay}` : serverDisplay;
  els.resultRealm.textContent = realm;

  els.resultDps.textContent = formatNumber(data.dps);
  els.resultDpsMin.textContent = formatNumber(data.dpsMin);
  els.resultDpsMax.textContent = formatNumber(data.dpsMax);
  els.resultDpsMedian.textContent = formatNumber(data.dpsMedian);

  if (data.iterations > 0) {
    els.resultIterations.textContent = `${formatNumber(data.iterations)} iterations`;
  }
  if (data.fightLength > 0) {
    els.resultFightLength.textContent = `${data.fightLength}s fight`;
  }
  if (data.targetError > 0) {
    els.resultError.textContent = `${data.targetError}% target error`;
  }
}

function startSimulation() {
  const config = els.input.value.trim();
  if (!config) return;

  saveConfig();
  els.btnSimulate.disabled = true;
  els.resultSection.classList.add("hidden");
  els.errorSection.classList.add("hidden");

  if (!worker) spawnWorker();
  worker.postMessage({
    type: "simulate",
    config,
    fightStyle: els.fightStyle.value,
  });
}

function cancelSimulation() {
  handleMessage({ type: "cancelled" });
}

els.input.addEventListener("input", saveConfig);
let inputJustFocused = false;
els.input.addEventListener("focus", () => {
  inputJustFocused = true;
});
els.input.addEventListener("mouseup", (e) => {
  if (inputJustFocused) {
    els.input.select();
    e.preventDefault();
    inputJustFocused = false;
  }
});
els.input.addEventListener("blur", () => {
  inputJustFocused = false;
});

els.btnSimulate.addEventListener("click", startSimulation);
els.btnClear.addEventListener("click", () => {
  els.input.value = "";
  saveConfig();
  els.input.focus();
});
els.btnCancel.addEventListener("click", cancelSimulation);
els.btnToggleLog.addEventListener("click", () => {
  els.logOutput.classList.toggle("hidden");
  els.btnToggleLog.textContent = els.logOutput.classList.contains("hidden") ? "Show" : "Hide";
});

if (!self.crossOriginIsolated) {
  console.warn(
    "crossOriginIsolated is false. Simulation will not start because SharedArrayBuffer is unavailable. Check that the server sends Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers."
  );
}

if ("serviceWorker" in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("/service-worker.js").catch((err) => {
    console.warn("Service worker registration failed:", err);
  });
  if (hadController) {
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    });
  }
}

loadConfig();
loadFightStyles();
spawnWorker();
