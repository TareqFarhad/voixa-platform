# Voixa Platform

> Premium AI Vocal Atelier · Turn a natural voice into a polished studio
> song while preserving the singer's identity.

Voixa is a full-stack monorepo containing a luxury Next.js front-end, a
NestJS API, a Python audio-processing worker, and the supporting
PostgreSQL + Redis infrastructure required to run the Voixa MVP.

## Monorepo

```
apps/
  web/      Next.js 14 frontend (App Router, Tailwind, Framer Motion)
  api/      NestJS backend with Prisma + JWT auth + Redis queue
  worker/   Python audio processing worker (DSP pipeline + Redis consumer)
scripts/    local helpers
.github/    GitHub Actions workflow that deploys the static landing to Pages
```

## Architecture

```text
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Next.js    │ ─▶ │  NestJS API  │ ─▶ │   Postgres   │
│  (Atelier)   │    │  Auth · CRUD │    │  (Prisma)    │
└──────────────┘    │  Uploads     │    └──────────────┘
        ▲           │  Processing  │
        │           └──────┬───────┘
        │                  │ enqueue
        │                  ▼
        │           ┌──────────────┐    ┌──────────────┐
        │           │    Redis     │ ─▶ │ Python worker│
        │           │   (BLPOP)    │    │  DSP pipeline│
        │           └──────────────┘    └──────────────┘
        │                                       │ callback
        └───────────────────────────────────────┘
```

The frontend talks to the API for everything. The API persists projects
in Postgres, stores raw uploads in object storage (local FS in dev, R2/S3
in production), pushes processing jobs onto a Redis list, and exposes a
callback endpoint the worker hits as the pipeline progresses. The
Python worker reads jobs, runs the multi-stage DSP pipeline (noise
reduction → tuning → alignment → enhancement → mastering), writes the
processed track back into storage, and notifies the API.

## Tech foundation

- **Frontend** — Next.js 14 (App Router), React 18, Tailwind CSS, Framer
  Motion, custom luxury design system
- **Backend** — NestJS 10, Prisma 5, PostgreSQL 16, JWT auth (Passport),
  ioredis queue producer, Multer-based uploads
- **Worker** — Python 3.11, librosa + soundfile + numpy DSP pipeline,
  Redis BLPOP consumer, requests callback to API
- **Infrastructure** — docker compose for Postgres + Redis, monorepo
  managed via pnpm workspaces

## Quick start

```bash
# 1. Copy environment templates
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env

# 2. Bring up Postgres + Redis
docker compose up -d

# 3. Install workspaces
pnpm install

# 4. Generate Prisma client and apply migrations
pnpm --filter @voixa/api prisma:generate
pnpm --filter @voixa/api prisma:deploy

# 5. Run all services in parallel (web, api, worker)
pnpm dev
```

You can also run `./scripts/dev-up.sh` for a one-shot bootstrap.

The Voixa atelier will be live at:

| Service | URL                              |
| ------- | -------------------------------- |
| Web     | http://localhost:3000            |
| API     | http://localhost:4000/api        |
| Health  | http://localhost:4000/api/health |

The Python worker requires `numpy`, `soundfile`, `librosa`, and
optionally `ffmpeg`. When any of those are missing the worker stays
online in **graceful degradation mode** - it copies audio through the
pipeline so the API and web app are still fully exercisable end to end.

## Available scripts

| Script             | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `pnpm dev`         | Run web, api, and worker concurrently         |
| `pnpm dev:web`     | Run only the Next.js frontend                 |
| `pnpm dev:api`     | Run only the NestJS backend                   |
| `pnpm dev:worker`  | Run only the Python worker                    |
| `pnpm build`       | Build every workspace that exposes `build`    |
| `pnpm typecheck`   | Type-check every workspace                    |
| `pnpm lint`        | Lint every workspace                          |

## API surface (MVP)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/reset-password
GET    /api/auth/me

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

POST   /api/uploads/vocal/:projectId          (multipart 'file')
POST   /api/uploads/instrumental/:projectId   (multipart 'file')

POST   /api/processing/start
GET    /api/processing/status/:jobId
POST   /api/processing/retry/:jobId
POST   /api/processing/callback               (worker → api)

GET    /api/profile
PUT    /api/profile
DELETE /api/profile/voice-model

GET    /api/exports/:projectId
GET    /api/storage/...                        (local dev only)
GET    /api/health
```

## Database (Prisma)

Entities: `User`, `Profile`, `Project`, `Asset`, `Job`, `VoiceProfile`.
Schema lives in `apps/api/prisma/schema.prisma`. The initial migration is
under `apps/api/prisma/migrations/20250101000000_init`.

## Pipeline stages (worker)

```
preparing → cleaning → tuning → aligning → polishing → mastering → finalizing
```

Each stage emits a callback to the API so the **Processing screen** can
show the artist where Voixa is in their session in real time.

## Premium UI direction

- Deep noir background with midnight, burgundy, and champagne accents
- `Cormorant Garamond` for display headings, `Inter` for body text
- Custom AI orb, animated waveform, and refinement-slider components
- Emotive UX writing — _"bring your voice"_, _"shape the feeling"_,
  _"refine your sound"_ — never technical jargon

## GitHub Pages deployment

This repo ships with a workflow at
`.github/workflows/deploy-pages.yml` that builds the Next.js frontend in
**static export** mode and publishes it to GitHub Pages on every push to
`main`.

To enable Pages on your fork:

1. Push to `main` (the workflow will run automatically).
2. In the repository **Settings → Pages**, set the source to
   **GitHub Actions** if it has not been set already.
3. Open the workflow run to find the deployed URL — typically
   `https://<owner>.github.io/<repo>/`.

> **Important.** GitHub Pages only hosts the static frontend (landing,
> auth shells, marketing pages). The full Voixa experience requires the
> Node.js API, Postgres, Redis, and Python worker running somewhere they
> can talk to each other. The static build still uses the same code so
> any deployment of the API can be configured via
> `NEXT_PUBLIC_API_URL` at build time.

## Roadmap (post-MVP)

- Stripe billing for the Premium and Studio tiers
- S3 / R2 storage driver swap (interface already in place)
- BullMQ-based processing queue with retries and dead-lettering
- Speaker embedding via Resemblyzer / ECAPA-TDNN for stronger identity
  preservation
- Neural pitch correction model behind the existing DSP slider
- Admin panel: user list, job monitoring, audit log
- Mobile-first capture experience

## License

Proprietary. © Voixa Atelier.
