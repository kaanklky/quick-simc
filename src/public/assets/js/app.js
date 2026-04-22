const EXAMPLE_PROFILE = `# Sozinn - Marksmanship - 2026-04-23 00:37 - EU/Twisting Nether
# SimC Addon 12.0.5-01
# WoW 12.0.5.67088, TOC 120005
# Requires SimulationCraft 1000-01 or newer

hunter="Sozinn"
level=90
race=blood_elf
region=eu
server=twisting_nether
role=attack
professions=mining=57/jewelcrafting=1
spec=marksmanship
# loot_spec=marksmanship

talents=C4PApei1JmYNvFfEFaN5bWuGKYzsMwAmgZYLwsAAAAAAAAAMjZMDzYmZMDGTzYmZstxYmlZmZmZmlxMLDGAAgxMzMzMzAwGMAbMDA

# Saved Loadout: iv-Single-Sentinel-12.0.1-02
# talents=C4PApei1JmYNvFfEFaN5bWuGKwCMwMGGLDgZwGAAAAAAAAwMmxMMjZmxMYMmxwYzmxgZGmZWYsMYAAAGzMzAwMstBDwGA
# Saved Loadout: iv-Single-DR-12.0.5-01
# talents=C4PApei1JmYNvFfEFaN5bWuGKYzsMwAGwMsBMLAAAAAAAAAzYGzwMmZGzgxYGzMjtNGzsMzMzMzsMmZZwAAAMmZmZmZGA2gBYjZA
# Saved Loadout: Razzoer-AoE-Sentinel-12.0.1-01
# talents=C4PApei1JmYNvFfEFaN5bWuGKwCMwMGGLDgZwGAAAAAAAAwMmxMMjZmxMsMGzYYsZzYwMDzMLMWGmBAAYMzMDAzwGYA2AA
# Saved Loadout: iv-AoE-Sentinel-12.0.1-02
# talents=C4PApei1JmYNvFfEFaN5bWuGKwCMwMGGLDgZwGAAAAAAAAwMmZmx2MmZGzwyYMjZMz22mZmhZGmZWGjlhZGAAAjxAwMjFGGgNGA
# Saved Loadout: iv-AoE-DR-12.0.5-01
# talents=C4PApei1JmYNvFfEFaN5bWuGKYzsMwAGwMsBMLAAAAAAAAAzYmZGbGzMjZYZMmxgZZjZmZZmZmZmZhZWGmZAAAmxYmZmBMAGgNmB

# Primal Sentry's Maw (263)
head=,id=249988,bonus_id=13338/13439/6652/12667/13575/12790
# Ribbon of Coiled Malice (266)
neck=,id=249337,bonus_id=42/13668/13334/12795
# Primal Sentry's Trophies (279)
shoulder=,id=249986,bonus_id=13340/13440/6652/13574/12803
# Voidbreaker's Cape (259)
back=,id=257172,bonus_id=6652/13577/12789
# Primal Sentry's Scaleplate (276)
chest=,id=249991,bonus_id=6652/13336/13575/12798
# Tabard of Summer Flames (1)
tabard=,id=35280
# Corewarden Cuffs (269)
wrist=,id=251209,bonus_id=13440/43/12667/13577/12699/12796
# Primal Sentry's Talonguards (276)
hands=,id=249989,bonus_id=6652/13440/13337/13574/12798
# Elder Mosscinch (259)
waist=,id=249651,bonus_id=6652/13534/13577/12789
# Primal Sentry's Legguards (282)
legs=,id=249987,bonus_id=6652/13440/13339/13575/12804
# Rigid Scale Boots (266)
feet=,id=258582,bonus_id=12795/13440/6652/13577/12699
# Omission of Light (266)
finger1=,id=251093,bonus_id=12795/13440/6652/13668/12699
# Occlusion of Void (263)
finger2=,id=251217,bonus_id=13440/6652/13668/12699/12790
# Glorious Crusader's Keepsake (266)
trinket1=,id=251792,bonus_id=6652/12795
# Void-Reaper's Libram (259)
trinket2=,id=251785,bonus_id=12793/6652
# Stormshaper's Crossbow (276)
main_hand=,id=258412,bonus_id=13440/6652/12701/12798

### Gear from Bags
#
# Primal Sentry's Legguards (276)
# legs=,id=249987,bonus_id=13339/13440/6652/13575/12798
#
# Hurricane's Heart (266)
# main_hand=,id=251095,bonus_id=12795/13440/6652/12701
#
# Sunstrike Rifle (259)
# main_hand=,id=249279,bonus_id=6652/13334/12793

### Additional Character Info
#
# catalyst_currencies=3269:8/3378:4/2813:8/3116:8
#
# upgrade_currencies=c:3347:77/c:3383:95/c:3341:56/c:3343:10/c:3345:16/i:228338:1/i:230906:7/i:228339:1/i:224072:1/i:231756:7/i:232875:7/i:229390:9/i:230936:1/i:231769:1/i:211296:11
#
# slot_high_watermarks=0:263:263/1:266:266/2:279:279/3:276:276/4:259:259/5:282:282/6:266:266/7:269:269/8:276:276/9:266:266/10:259:259/11:259:259/12:276:276/13:0:0/14:0:0/15:0:0/16:0:0
#
# upgrade_achievements=40107/40942/40943/40944/41886/41887/41888/41892/42767/61809

# Checksum: ae5bb903`;

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
  navigator.serviceWorker.register("/service-worker.js").catch((err) => {
    console.warn("Service worker registration failed:", err);
  });
}

loadConfig();
loadFightStyles();
spawnWorker();
