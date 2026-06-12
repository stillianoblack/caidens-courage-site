#!/usr/bin/env bash
# Pull Netlify env vars into .env.local (CRA REACT_APP_* only).
# Prereqs: netlify login && netlify link (from repo root)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/.env.local"

if ! command -v netlify >/dev/null 2>&1; then
  echo "Netlify CLI not found. Install: npm i -g netlify-cli"
  echo "Or run: npx netlify-cli env:import --filter REACT_APP_ .env.local"
  exit 1
fi

cd "$ROOT"

echo "# Synced from Netlify on $(date -u +%Y-%m-%dT%H:%MZ)" > "$OUT"
echo "# Restart yarn start after this script runs." >> "$OUT"
echo "" >> "$OUT"

netlify env:list --json | node -e "
const fs = require('fs');
const rows = JSON.parse(fs.readFileSync(0, 'utf8'));
const keys = Object.keys(rows).filter((k) => k.startsWith('REACT_APP_')).sort();
for (const key of keys) {
  const value = rows[key] ?? '';
  const escaped = String(value).replace(/\"/g, '\\\\\"');
  process.stdout.write(key + '=\"' + escaped + '\"\\n');
}
" >> "$OUT"

echo "Wrote $(wc -l < "$OUT" | tr -d ' ') lines to .env.local"
echo "Restart: yarn start"
