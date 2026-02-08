#!/usr/bin/env bash
# Copy repo out of iCloud into ~/Projects and start dev server.
# Run from anywhere, or from this repo root:
#   bash scripts/clone-to-local-dev.sh

set -e

REPO_NAME="caidenscourage"
SOURCE="${1:-$PWD}"
DEST="$HOME/Projects/$REPO_NAME"

echo "1) Ensuring ~/Projects exists..."
mkdir -p "$HOME/Projects"

echo "2) Copying repo to $DEST (this may take a minute)..."
rsync -a --delete \
  "${SOURCE%/}/" \
  "$DEST/"

echo "3) Switching to $DEST..."
cd "$DEST"

echo "4) Confirming path (should NOT include 'Mobile Documents'):"
pwd

echo "5) Cleaning and reinstalling dependencies..."
rm -rf node_modules
yarn install

echo "6) Starting dev server..."
yarn start
