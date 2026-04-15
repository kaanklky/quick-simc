#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SIMC_REPO="https://github.com/simulationcraft/simc.git"
SIMC_BRANCH="${SIMC_BRANCH:-midnight}"
SIMC_DIR="$ROOT_DIR/simc"
BIN_DIR="$ROOT_DIR/src/bin"

if [ ! -d "$SIMC_DIR" ]; then
  echo "Cloning simc ($SIMC_BRANCH)..."
  git clone --depth 1 --branch "$SIMC_BRANCH" "$SIMC_REPO" "$SIMC_DIR"
fi

echo "Building simc..."
mkdir -p "$SIMC_DIR/build"
cd "$SIMC_DIR/build"
cmake -DBUILD_GUI=OFF -DSC_NO_NETWORKING=ON ..
make -j"$(nproc)"

echo "Installing binary..."
mkdir -p "$BIN_DIR"
cp "$SIMC_DIR/build/simc" "$BIN_DIR/simc"

echo "Installing dependencies..."
cd "$ROOT_DIR/src"
npm install

echo "Done. Run: cd src && npm start"
