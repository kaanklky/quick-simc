# Quick SimC

> **What is this?**
> A web wrapper around [SimulationCraft](https://github.com/simulationcraft/simc) (midnight branch). Paste your SimC addon export, hit Simulate, get your DPS.

> **Why?**
> No queue, no CLI, no desktop app. Just a browser tab. Paste, click, done.

> **How does it work?**
> The server clones and builds simc from source as a native binary. When you simulate, your config is written to a temp file, passed to the binary, and streamed back over WebSocket. Dangerous config directives (`output=`, `html=`, `json=`, `input=`, `save_*`) are blocked before reaching the binary.

## Running locally

Requires cmake, g++, make, git:

```bash
./setup.sh
cd src && npm start
```

`setup.sh` clones simc, builds it, copies the binary to `src/bin/`, and runs `npm install`. Set `SIMC_BRANCH` to build a different branch:

```bash
SIMC_BRANCH=thewarwithin ./setup.sh
```

## Docker

```bash
docker build -t quick-simc .
docker run -p 3000:3000 quick-simc
```

## Configuration

All options are environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Web server port |
| `WEB_ACCESS_CODE` | *(empty)* | If set, requires this code to access the app. Redirects to a login page, sets an httpOnly cookie on success. |
| `SIMC_BIN` | `./bin/simc` | Path to simc binary (for local dev) |

Docker build args:

| Arg | Default | Description |
|---|---|---|
| `SIMC_BRANCH` | `midnight` | SimC git branch to clone and build |

### Examples

```bash
# local with auth
cd src && WEB_ACCESS_CODE=hunter2 npm start

# docker with custom branch and auth
docker build --build-arg SIMC_BRANCH=thewarwithin -t quick-simc .
docker run -p 8080:8080 -e PORT=8080 -e WEB_ACCESS_CODE=hunter2 quick-simc
```

## Screenshots

![Input](docs/input.png)

---

![Progress](docs/progress.png)

---

![Result](docs/result.png)
