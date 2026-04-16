const express = require("express");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
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
body{font-family:-apple-system,BlinkMacSystemFont,"Inter",sans-serif;background:#08080f;color:#e8e6f0;min-height:100vh;display:flex;align-items:center;justify-content:center}
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

app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
});

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

app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    },
  })
);

app.get("/api/fight-styles", (_req, res) => {
  res.json(VALID_FIGHT_STYLES);
});

const server = app.listen(PORT, () => {
  console.log(`Quick SimC running at http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
