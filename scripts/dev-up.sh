#!/usr/bin/env bash
set -euo pipefail

docker compose up -d
pnpm install
pnpm dev
