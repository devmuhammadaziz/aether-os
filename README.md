# AETHER OS

Browser-based holographic workspace: MediaPipe hand tracking, React Three Fiber neon scene, and a Bun/Elysia AI proxy for text-to-3D spawning.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js (App Router), TypeScript, TailwindCSS |
| 3D | React Three Fiber, drei, postprocessing (bloom + chromatic aberration) |
| Vision | `@mediapipe/tasks-vision` HandLandmarker (client WASM) |
| API | Bun + Elysia (`/api/spawn`, `/health`) |

## Quick start

```bash
# First time only
cp .env.example .env   # optional: set OPENAI_API_KEY
npm run setup          # installs server + web deps

# Run everything (API :3001 + web :3000)
npm run dev
```

Open http://localhost:3000 — API is proxied via Next rewrites.

Open the app, click **ENABLE VISION**, allow the webcam, then type a prompt (e.g. `Spawn a futuristic drone`) and press **SPAWN**.

## Gestures

| Gesture | Action |
|---------|--------|
| Pinch near object | Grab / move |
| Fast release (flick) | Toss toward spatial dock |
| Pinch in empty space | Air-sculpt neon tubes |
| Dual fists pull apart | Exploded / deconstruct view |
| Clap | Snap parts back |
| Non-dominant open palm | Clipping scalpel plane |
| Low micro-motion | Intent = resting (blocks grabs) |

## Deploy

### Frontend (Vercel)

1. Set Vercel root directory to `web/`
2. Set env `API_ORIGIN` to your public API URL (used by Next rewrites)
3. Deploy; see [`web/vercel.json`](web/vercel.json)

### API (Docker)

```bash
docker compose up --build api
# or
cd server && docker build -t aether-api . && docker run -p 3001:3001 -e CORS_ORIGIN=https://your-app.vercel.app aether-api
```

Ensure `CORS_ORIGIN` matches your Vercel domain.

## Project layout

```
idea/
  web/                 Next.js UI + R3F + HandTracker
  server/              Elysia AI proxy
  docker-compose.yml
  .env.example
```

## Notes

- Without `OPENAI_API_KEY`, `/api/spawn` returns deterministic mock geometries.
- MongoDB is reserved in `.env.example` but not required for v1.
- HTTPS (or localhost) is required for `getUserMedia`.
