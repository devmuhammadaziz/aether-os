#!/usr/bin/env bash
# Deploy from GitHub clone (no rsync).
# Run ON YOUR MAC (SSHs into VPS).
#
#   ./scripts/deploy-vps.sh

set -euo pipefail

VPS_HOST="${VPS_HOST:-deploy@94.156.189.5}"
REMOTE_DIR="${REMOTE_DIR:-/home/deploy/aether-os}"
REPO_URL="${REPO_URL:-https://github.com/devmuhammadaziz/aether-os.git}"
BRANCH="${BRANCH:-main}"
APP_NAME="aether-os"
PORT="3011"

echo "==> Deploy ${REPO_URL} (${BRANCH}) → ${VPS_HOST}:${REMOTE_DIR}"

ssh -t "$VPS_HOST" bash -s <<EOF
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y git
fi

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm i -g pm2
fi

if [ -d "${REMOTE_DIR}/.git" ]; then
  echo "==> Pull latest"
  cd "${REMOTE_DIR}"
  git fetch origin
  git checkout "${BRANCH}"
  git reset --hard "origin/${BRANCH}"
else
  echo "==> Clone repo"
  rm -rf "${REMOTE_DIR}"
  git clone --branch "${BRANCH}" "${REPO_URL}" "${REMOTE_DIR}"
  cd "${REMOTE_DIR}"
fi

echo "==> Install + build (web/)"
cd "${REMOTE_DIR}/web"
npm ci || npm install
npm run build

# Keep PM2 cwd aligned with this server path
cd "${REMOTE_DIR}"
sed -i "s|cwd: \".*\"|cwd: \"${REMOTE_DIR}/web\"|" ecosystem.config.cjs || true

echo "==> PM2 restart (${APP_NAME}) — does not touch osonbot / asl-alphabet"
pm2 delete ${APP_NAME} >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs
pm2 save

echo ""
pm2 ls
echo ""
echo "App on 127.0.0.1:${PORT}"
echo "HTTPS URL next:"
echo "  cd ${REMOTE_DIR} && bash scripts/vps-tunnel.sh"
echo "  pm2 logs aether-os-tunnel --lines 40"
EOF

echo "==> Deploy finished."
