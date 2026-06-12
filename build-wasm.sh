#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SIMC_REPO="https://github.com/simulationcraft/simc.git"
SIMC_BRANCH="${SIMC_BRANCH:-midnight}"
SIMC_REF="${SIMC_REF:-}"
SIMC_DIR="${SIMC_DIR:-$ROOT_DIR/simc}"
BUILD_DIR="${BUILD_DIR:-$SIMC_DIR/build-wasm}"
PUBLIC_DIR="${PUBLIC_DIR:-$ROOT_DIR/src/public}"
OUT_DIR="${OUT_DIR:-$PUBLIC_DIR/assets/wasm}"
EMSDK_DIR="${EMSDK_DIR:-$HOME/.emsdk}"
NO_INJECT="${NO_INJECT:-0}"
INJECT_ONLY="${INJECT_ONLY:-0}"

if [ "$INJECT_ONLY" != "1" ]; then

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
  if [ -n "$SIMC_REF" ]; then
    git clone --branch "$SIMC_BRANCH" "$SIMC_REPO" "$SIMC_DIR"
  else
    git clone --depth 1 --branch "$SIMC_BRANCH" "$SIMC_REPO" "$SIMC_DIR"
  fi
fi

if [ -n "$SIMC_REF" ]; then
  echo "Checking out simc ref $SIMC_REF..."
  if ! git -C "$SIMC_DIR" cat-file -e "$SIMC_REF" 2>/dev/null; then
    git -C "$SIMC_DIR" fetch --depth 1 origin "$SIMC_REF" \
      || git -C "$SIMC_DIR" fetch --unshallow origin
  fi
  git -C "$SIMC_DIR" checkout --detach "$SIMC_REF"
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
LINKER_FLAGS="$LINKER_FLAGS -fexceptions"

echo "Configuring simc with emcmake -> $BUILD_DIR..."
emcmake cmake -S "$SIMC_DIR" -B "$BUILD_DIR" \
  -DCMAKE_BUILD_TYPE=Release \
  -DBUILD_GUI=OFF \
  -DSC_NO_NETWORKING=ON \
  -DCMAKE_CXX_FLAGS="-pthread -O3 -fexceptions" \
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

echo "Compressing simc.wasm..."
if command -v brotli >/dev/null 2>&1; then
  brotli -k -f -q 11 "$OUT_DIR/simc.wasm"
else
  echo "Warning: brotli not installed, skipping .wasm.br" >&2
fi
if command -v gzip >/dev/null 2>&1; then
  gzip -k -f -9 "$OUT_DIR/simc.wasm"
else
  echo "Warning: gzip not installed, skipping .wasm.gz" >&2
fi

WASM_HASH="$(sha256sum "$OUT_DIR/simc.wasm" | head -c 12)"
HASH_DIR="$OUT_DIR/$WASM_HASH"
echo "Moving WASM bundle into $HASH_DIR..."
find "$OUT_DIR" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +
mkdir -p "$HASH_DIR"
mv "$OUT_DIR/simc.js" "$HASH_DIR/simc.js"
mv "$OUT_DIR/simc.wasm" "$HASH_DIR/simc.wasm"
[ -f "$OUT_DIR/simc.wasm.br" ] && mv "$OUT_DIR/simc.wasm.br" "$HASH_DIR/simc.wasm.br"
[ -f "$OUT_DIR/simc.wasm.gz" ] && mv "$OUT_DIR/simc.wasm.gz" "$HASH_DIR/simc.wasm.gz"
[ -f "$OUT_DIR/simc.worker.js" ] && mv "$OUT_DIR/simc.worker.js" "$HASH_DIR/simc.worker.js"

fi  # INJECT_ONLY guard

if [ "$NO_INJECT" != "1" ]; then
  SIMC_MAJOR="$(grep -oE '#define[[:space:]]+SC_MAJOR_VERSION[[:space:]]+"[^"]+"' "$SIMC_DIR/engine/config.hpp" | grep -oE '"[^"]+"' | tr -d '"')"
  SIMC_MINOR="$(grep -oE '#define[[:space:]]+SC_MINOR_VERSION[[:space:]]+"[^"]+"' "$SIMC_DIR/engine/config.hpp" | grep -oE '"[^"]+"' | tr -d '"')"
  SIMC_VERSION="${SIMC_MAJOR}-${SIMC_MINOR}"
  WOW_VERSION="$(grep -oE 'CLIENT_DATA_WOW_VERSION[[:space:]]+"[^"]+"' "$SIMC_DIR/engine/dbc/generated/client_data_version.inc" | grep -oE '"[^"]+"' | tr -d '"')"
  PATCH_NAME="${WOW_PATCH_NAME:-Midnight}"
  APP_VERSION="${APP_VERSION:-$(git -C "$ROOT_DIR" describe --tags --always 2>/dev/null || echo dev)}"
  SUBTITLE="SimulationCraft ${SIMC_VERSION} / ${PATCH_NAME} ${WOW_VERSION}"

  WASM_BUNDLE="${WASM_HASH:-}"
  if [ -z "$WASM_BUNDLE" ] && [ -d "$OUT_DIR" ]; then
    WASM_BUNDLE="$(find "$OUT_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' 2>/dev/null | grep -E '^[a-f0-9]+$' | head -n 1 || true)"
  fi

  INDEX_HTML="$PUBLIC_DIR/index.html"
  SW_JS="$PUBLIC_DIR/service-worker.js"
  SIM_WORKER_JS="$PUBLIC_DIR/assets/js/sim-worker.js"
  if [ -f "$INDEX_HTML" ]; then
    echo "Injecting subtitle into $INDEX_HTML: $SUBTITLE"
    sed -i -E "s|(<span class=\"subtitle\">)[^<]*(</span>)|\1${SUBTITLE}\2|" "$INDEX_HTML"
    if [ -n "$WASM_BUNDLE" ]; then
      echo "Injecting WASM_BUNDLE into $INDEX_HTML preload: $WASM_BUNDLE"
      sed -i -E "s|(href=\"/assets/wasm/)[^/\"]+(/simc\.wasm\")|\1${WASM_BUNDLE}\2|g" "$INDEX_HTML"
    fi
  fi
  if [ -f "$SW_JS" ]; then
    echo "Injecting CACHE_VERSION into $SW_JS: $APP_VERSION"
    sed -i -E "s|^(const CACHE_VERSION = )\"[^\"]*\";|\1\"${APP_VERSION}\";|" "$SW_JS"
    if [ -n "$WASM_BUNDLE" ]; then
      echo "Injecting WASM_BUNDLE into $SW_JS: $WASM_BUNDLE"
      sed -i -E "s|^(const WASM_BUNDLE = )\"[^\"]*\";|\1\"${WASM_BUNDLE}\";|" "$SW_JS"
    fi
  fi
  if [ -f "$SIM_WORKER_JS" ] && [ -n "$WASM_BUNDLE" ]; then
    echo "Injecting WASM_BUNDLE into $SIM_WORKER_JS: $WASM_BUNDLE"
    sed -i -E "s|^(const WASM_BUNDLE = )\"[^\"]*\";|\1\"${WASM_BUNDLE}\";|" "$SIM_WORKER_JS"
  fi
fi

echo "Done. Artifacts in $OUT_DIR."
