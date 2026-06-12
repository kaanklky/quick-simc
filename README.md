# Quick SimC

> **What is this?**
> A web wrapper around [SimulationCraft](https://github.com/simulationcraft/simc) (midnight branch). Paste your SimC addon export, hit Simulate, get your DPS.

> **Why?**
> No queue, no CLI, no desktop app. Just a browser tab. Paste, click, done.

> **How does it work?**
> SimulationCraft is compiled to WebAssembly with Emscripten (pthreads + SharedArrayBuffer). The whole simulation runs client-side in a Web Worker using all available cores. An nginx container does nothing but serve static files and issue cross-origin-isolation headers (required for SharedArrayBuffer). A Service Worker caches the WASM bundle so repeat visits are instant. The WASM file is pre-compressed at build time (brotli + gzip) and served with the matching `Content-Encoding`, so it stays under Cloudflare's 100 MB proxy limit and downloads fast even on slow links. Dangerous config directives (`output=`, `html=`, `json=`, `input=`, `save_*`) are stripped before the config reaches simc.

## Running locally

Requires cmake, g++, make, git, python3 (emsdk deps). Serving needs either Docker or any static file server that can set COOP/COEP headers — there is no Node server anymore.

```bash
./build-wasm.sh
docker build -t quick-simc .
docker run -p 3000:3000 quick-simc
```

`build-wasm.sh` installs emsdk into `~/.emsdk` if missing, clones simc, builds it to WebAssembly with `emcmake`, and copies the artifacts into a content-addressed subdirectory `src/public/assets/wasm/<HASH>/` (where `<HASH>` is the first 12 hex chars of `sha256(simc.wasm)`). Old hash directories under `src/public/assets/wasm/` are deleted on each build. Set `SIMC_BRANCH` and `WOW_PATCH_NAME` to build a different expansion:

```bash
SIMC_BRANCH=thewarwithin WOW_PATCH_NAME="The War Within" ./build-wasm.sh
```

After the WASM build, `build-wasm.sh` also rewrites several files **in place** so the frontend points at the new bundle:

- `src/public/index.html`: the subtitle span (simc version from `engine/config.hpp` and WoW patch version from `engine/dbc/generated/client_data_version.inc`) and the `<link rel="preload">` href for `simc.wasm`.
- `src/public/service-worker.js`: the `CACHE_VERSION` constant (derived from `git describe --tags --always`, override with `APP_VERSION=...`) and the `WASM_BUNDLE` constant.
- `src/public/assets/js/sim-worker.js`: the `WASM_BUNDLE` constant (used in `importScripts`, `locateFile`, and `mainScriptUrlOrBlob`).

Do not commit the injected values back — the placeholders should stay as `"dev"`. Use `NO_INJECT=1 ./build-wasm.sh` to skip the rewrite step. Use `INJECT_ONLY=1 ./build-wasm.sh` to only run the rewrite step against an existing `src/public/assets/wasm/<HASH>/` (this is what the Dockerfile uses after copying `src/public/` over the wasm-builder stage's output).

The content-addressed path means CDN/proxy caches (Cloudflare, etc.) can hold every historical bundle forever without ever serving a mismatched `simc.js` + `simc.wasm` pair — each release publishes a new path, the hashed bundle is served with `Cache-Control: public, max-age=31536000, immutable`, and the entrypoint files (`index.html`, `service-worker.js`, `/assets/js/`, `/assets/css/`) are served `Cache-Control: no-cache` so a deploy is picked up on the next request.

The first WASM build takes 15-40 minutes. The resulting `simc.wasm` is ~100 MB uncompressed; `build-wasm.sh` also emits `simc.wasm.br` (~7 MB) and `simc.wasm.gz` (~18 MB) which nginx picks based on `Accept-Encoding`. Install `brotli` locally (Debian/Ubuntu: `apt install brotli`) before running the build if you want the smaller variant. Everything is cached in the browser on first visit via Service Worker.

## Docker

```bash
docker build -t quick-simc .
docker run -p 3000:3000 quick-simc
```

The image compiles simc to WASM inside an `emscripten/emsdk` build stage and ships only nginx + static assets + WASM in the runtime stage (no native simc binary, no Node runtime).

## Configuration

All options are environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Web server port (substituted into `nginx.conf` at container start) |

Docker build args:

| Arg | Default | Description |
|---|---|---|
| `SIMC_BRANCH` | `midnight` | SimC git branch to clone and build |
| `SIMC_REF` | *(empty)* | Pin to a specific simc commit SHA. Without this, Docker's layer cache misses new upstream commits; CI sets this automatically via `git ls-remote`. |
| `APP_VERSION` | `dev` | Injected into the service worker as `CACHE_VERSION`. CI passes the git tag (or `sha-<short>`) so each release cuts its own cache key. |
| `WOW_PATCH_NAME` | `Midnight` | Display name for the WoW expansion (used in the UI subtitle). Set together with `SIMC_BRANCH`. |

### Examples

```bash
# custom port
docker build -t quick-simc .
docker run -p 8080:8080 -e PORT=8080 quick-simc

# custom branch
docker build --build-arg SIMC_BRANCH=thewarwithin --build-arg WOW_PATCH_NAME="The War Within" -t quick-simc .
```

## Browser requirements

- SharedArrayBuffer support (Chrome 68+, Firefox 79+, Safari 15.2+). Nginx sends COOP/COEP headers to enable `crossOriginIsolated`.
- Enough RAM for the sim (typically 256 MB-1 GB depending on iterations).

## Screenshots

![Input](docs/input.png)

---

![Progress](docs/progress.png)

---

![Result](docs/result.png)
