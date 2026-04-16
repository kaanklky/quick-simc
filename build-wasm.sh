#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SIMC_REPO="https://github.com/simulationcraft/simc.git"
SIMC_BRANCH="${SIMC_BRANCH:-midnight}"
SIMC_DIR="${SIMC_DIR:-$ROOT_DIR/simc}"
BUILD_DIR="${BUILD_DIR:-$SIMC_DIR/build-wasm}"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/src/public/wasm}"
EMSDK_DIR="${EMSDK_DIR:-$HOME/.emsdk}"
SKIP_NPM="${SKIP_NPM:-0}"

if ! command -v emcc >/dev/null 2>&1; then
  if [ ! -d "$EMSDK_DIR" ]; then
    echo "Installing emsdk into $EMSDK_DIR..."
    git clone https://github.com/emscripten-core/emsdk.git "$EMSDK_DIR"
    "$EMSDK_DIR/emsdk" install latest
    "$EMSDK_DIR/emsdk" activate latest
  fi
  source "$EMSDK_DIR/emsdk_env.sh"
fi

if [ ! -d "$SIMC_DIR" ]; then
  echo "Cloning simc ($SIMC_BRANCH) into $SIMC_DIR..."
  git clone --depth 1 --branch "$SIMC_BRANCH" "$SIMC_REPO" "$SIMC_DIR"
fi

LINKER_FLAGS="-pthread"
LINKER_FLAGS="$LINKER_FLAGS -sMODULARIZE=1"
LINKER_FLAGS="$LINKER_FLAGS -sEXPORT_NAME=createSimcModule"
LINKER_FLAGS="$LINKER_FLAGS -sALLOW_MEMORY_GROWTH=1"
LINKER_FLAGS="$LINKER_FLAGS -sINITIAL_MEMORY=256MB"
LINKER_FLAGS="$LINKER_FLAGS -sMAXIMUM_MEMORY=2GB"
LINKER_FLAGS="$LINKER_FLAGS -sPTHREAD_POOL_SIZE=navigator.hardwareConcurrency"
LINKER_FLAGS="$LINKER_FLAGS -sPTHREAD_POOL_SIZE_STRICT=0"
LINKER_FLAGS="$LINKER_FLAGS -sEXPORTED_RUNTIME_METHODS=callMain,FS"
LINKER_FLAGS="$LINKER_FLAGS -sINVOKE_RUN=0"
LINKER_FLAGS="$LINKER_FLAGS -sEXIT_RUNTIME=1"
LINKER_FLAGS="$LINKER_FLAGS -sENVIRONMENT=worker"
LINKER_FLAGS="$LINKER_FLAGS -sFORCE_FILESYSTEM=1"

echo "Configuring simc with emcmake -> $BUILD_DIR..."
emcmake cmake -S "$SIMC_DIR" -B "$BUILD_DIR" \
  -DCMAKE_BUILD_TYPE=Release \
  -DBUILD_GUI=OFF \
  -DSC_NO_NETWORKING=ON \
  -DCMAKE_CXX_FLAGS="-pthread -O3" \
  -DCMAKE_C_FLAGS="-pthread -O3" \
  -DCMAKE_EXE_LINKER_FLAGS="$LINKER_FLAGS"

echo "Building simc WASM..."
emmake make -C "$BUILD_DIR" -j"$(nproc)" simc

echo "Copying artifacts to $OUT_DIR..."
mkdir -p "$OUT_DIR"
SIMC_JS="$(find "$BUILD_DIR" -maxdepth 3 -name 'simc.js' | head -n 1)"
SIMC_WASM="$(find "$BUILD_DIR" -maxdepth 3 -name 'simc.wasm' | head -n 1)"
if [ -z "$SIMC_JS" ] || [ -z "$SIMC_WASM" ]; then
  echo "Error: simc.js or simc.wasm not found under $BUILD_DIR" >&2
  exit 1
fi
cp "$SIMC_JS" "$OUT_DIR/simc.js"
cp "$SIMC_WASM" "$OUT_DIR/simc.wasm"
SIMC_WORKER_JS="$(find "$BUILD_DIR" -maxdepth 3 -name 'simc.worker.js' | head -n 1 || true)"
if [ -n "${SIMC_WORKER_JS:-}" ]; then
  cp "$SIMC_WORKER_JS" "$OUT_DIR/simc.worker.js"
fi

if [ "$SKIP_NPM" != "1" ]; then
  echo "Installing Node dependencies..."
  cd "$ROOT_DIR/src"
  npm install
  echo "Done. Run: cd src && npm start"
else
  echo "Done. Artifacts in $OUT_DIR."
fi
