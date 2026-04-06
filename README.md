# Voixa Platform

Voixa is a premium AI Vocal Studio MVP scaffold for turning a user's natural voice into polished studio-style songs while preserving identity.

## Monorepo structure

```text
apps/
  web/      # Next.js + React + Tailwind frontend
  api/      # NestJS backend API
  worker/   # Python AI worker scaffold
scripts/    # local helper scripts
```

## Tech foundation

- **Frontend:** Next.js App Router, React, Tailwind CSS, Framer Motion-ready setup
- **Backend:** NestJS modular API with placeholder domain modules
- **Data services:** PostgreSQL + Redis via Docker Compose
- **Worker:** Python service scaffold with typed processing contract placeholders

## Quick start

1. Copy environment templates:
   - `cp .env.example .env`
   - `cp apps/web/.env.example apps/web/.env.local`
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/worker/.env.example apps/worker/.env`
2. Start infrastructure:
   - `docker compose up -d`
3. Install workspace dependencies:
   - `pnpm install`
4. Run all services:
   - `pnpm dev`

Alternatively run `./scripts/dev-up.sh`.

## Available scripts

- `pnpm dev` - run frontend, backend, and worker in parallel
- `pnpm dev:web` - run frontend only
- `pnpm dev:api` - run backend only
- `pnpm dev:worker` - run Python worker health runner
- `pnpm build` - workspace build (if script exists per app)
- `pnpm lint` - workspace lint (if script exists per app)

## Current foundation status

Implemented in this scaffold:
- monorepo workspace configuration
- base Next.js app with premium dark theme primitives and core placeholder routes
- base NestJS app with health endpoint + module placeholders (`auth`, `projects`, `uploads`, `processing`, `profile`)
- Python worker package with configuration, typed job model, and pipeline stage placeholders
- Docker Compose services for Postgres + Redis

Planned next (not yet implemented):
- Prisma schema and migrations
- authentication flows
- project creation/upload/processing orchestration
- AI model integration and real audio pipeline
# voixa-platform

A premium AI vocal studio that enhances your real voice into professional music.

## OpenCode prompt-pack workflow

Use the Voixa prompt pack sequentially (Prompt 1 through Prompt 20), one prompt at a time.

### Recommended execution rules

- Keep changes incremental and safe.
- Before edits, list the files to be created/modified.
- After edits, summarize what was implemented.
- Preserve modular architecture and premium UX direction.
- Run checks after major milestones and fix errors before continuing.
- Mark placeholders clearly instead of presenting them as complete.

### Quick control prompt

If implementation drifts, reuse this control instruction:

> Stay aligned with the existing Voixa codebase and do not rebuild unnecessarily. Work in small safe steps, avoid overwriting working code without reason, list files before changing code, summarize after changes, keep architecture modular and UI premium, run checks after major changes, fix errors before continuing, and mark placeholders clearly.
