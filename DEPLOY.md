# Deploy from GitHub (no rsync / no domain)

**Repo:** https://github.com/devmuhammadaziz/aether-os.git  
**VPS:** `deploy@94.156.189.5`  
**Folder:** `/home/deploy/aether-os`  
**PM2 name:** `aether-os` (does **not** touch `osonbot` or `asl-alphabet`)  
**Port:** `3011` → `127.0.0.1:3011`  
**App cwd:** `/home/deploy/aether-os/web` (Next.js)

Env vars live in [`ecosystem.config.cjs`](ecosystem.config.cjs) — no `.env` on the VPS.  
**Never commit real API keys** (GitHub push protection will block). After clone, edit `OPENAI_API_KEY` on the VPS only.

---

## Chosen IDs

| Key | Value |
|-----|--------|
| PROJECT_SLUG | `aether-os` |
| PORT | `3011` |
| GitHub | `https://github.com/devmuhammadaziz/aether-os.git` |
| Remote dir | `/home/deploy/aether-os` |
| Tunnel PM2 | `aether-os-tunnel` |

---

## Mac — push to GitHub (first)

```bash
cd ~/Desktop/codes/idea

# create empty repo on GitHub first: github.com/new → aether-os (private recommended)

git init
git add -A
git status   # confirm .env is NOT listed (gitignored)
git commit -m "deploy: aether-os PM2 + cloudflare tunnel"
git branch -M main
git remote add origin https://github.com/devmuhammadaziz/aether-os.git
git push -u origin main
```

Later updates:

```bash
cd ~/Desktop/codes/idea
git add -A && git commit -m "update" && git push origin main
```

---

## Option A — one command from your Mac

```bash
cd ~/Desktop/codes/idea
chmod +x scripts/deploy-vps.sh scripts/vps-tunnel.sh
./scripts/deploy-vps.sh
```

Enter VPS password when asked. It clones/pulls, builds `web/`, starts PM2 `aether-os`.

Then HTTPS tunnel (still on Mac via SSH, or on VPS):

```bash
ssh deploy@94.156.189.5
cd ~/aether-os
bash scripts/vps-tunnel.sh
pm2 logs aether-os-tunnel --lines 40
```

Copy `https://….trycloudflare.com`.

---

## Option B — everything on the VPS

```bash
ssh deploy@94.156.189.5
```

```bash
cd ~
git clone https://github.com/devmuhammadaziz/aether-os.git aether-os
cd aether-os/web
npm install
npm run build

cd ..
# ensure cwd matches this host
sed -i 's|cwd: ".*"|cwd: "/home/deploy/aether-os/web"|' ecosystem.config.cjs

pm2 delete aether-os 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 ls
```

**HTTPS (camera needs it):**

```bash
cd ~/aether-os
bash scripts/vps-tunnel.sh
pm2 logs aether-os-tunnel --lines 40
pm2 save
# once: pm2 startup  → run the sudo command it prints
```

**Later updates:**

```bash
cd ~/aether-os
git pull origin main
cd web
npm install
npm run build
pm2 restart aether-os
```

---

## Local production check (Mac)

```bash
cd ~/Desktop/codes/idea
npm --prefix web install
npm run build
npm start
# → http://127.0.0.1:3011
```

---

## If the repo is private

```bash
git clone https://YOUR_GITHUB_TOKEN@github.com/devmuhammadaziz/aether-os.git aether-os
```

Or add a deploy key on the VPS.

---

## Notes

- Bun/`server/` is **optional** for local dual-process dev only. Production uses Next.js `/api/spawn`.
- Do not change PM2 apps `osonbot` or `asl-alphabet` (port 3010).
- Quick tunnel URL changes when `aether-os-tunnel` restarts.
