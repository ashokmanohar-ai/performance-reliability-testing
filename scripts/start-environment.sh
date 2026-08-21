#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example to .env and replace placeholder secrets." >&2
  exit 1
fi

docker compose up -d --build
node scripts/wait-for-health.js
node scripts/seed-data.js
