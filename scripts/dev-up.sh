#!/usr/bin/env bash
set -euo pipefail

# Voixa local development bootstrap.
# 1. Brings up Postgres + Redis via docker compose
# 2. Installs Node workspaces (pnpm)
# 3. Generates the Prisma client and applies migrations
# 4. Starts the web, api, and worker dev processes in parallel

cd "$(dirname "$0")/.."

echo "→ Starting infrastructure (postgres + redis)…"
docker compose up -d

echo "→ Installing JavaScript workspaces…"
pnpm install

echo "→ Preparing Prisma client and applying migrations…"
pnpm --filter @voixa/api prisma:generate
pnpm --filter @voixa/api prisma:deploy || true

echo "→ Launching Voixa atelier…"
pnpm dev
