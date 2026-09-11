#!/usr/bin/env bash
#
# One-command deploy for the server:
#
#   ./deploy.sh
#
# Pulls the latest code, builds the Angular frontend into backend/client, builds
# the NestJS backend into backend/dist, then (re)starts it under PM2. The backend
# serves both the API and the frontend on the PORT set in backend/.env.
#
set -euo pipefail

APP_NAME="hms"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

# ── Preflight ────────────────────────────────────────────────────────────────
command -v node >/dev/null || fail "node is not installed"
command -v npm  >/dev/null || fail "npm is not installed"
command -v pm2  >/dev/null || fail "pm2 is not installed - run: npm i -g pm2"
[ -f "$ROOT/backend/.env" ] || fail "backend/.env is missing - copy backend/.env.example and fill it in"

PORT="$(sed -n 's/^PORT=//p' "$ROOT/backend/.env" | tail -n1 | tr -d "\"' \r")"
PORT="${PORT:-3000}"   # same fallback as backend/src/main.ts

# ── 1. Latest code ───────────────────────────────────────────────────────────
# --ff-only: refuse to create a merge commit on the server; fix it in git instead.
step "Pulling latest code"
git -C "$ROOT" pull --ff-only

# ── 2. Frontend -> backend/client ────────────────────────────────────────────
step "Building frontend"
cd "$ROOT/frontend"
npm ci
npm run build

# ── 3. Backend -> backend/dist ───────────────────────────────────────────────
# Plain `npm ci`, not --omit=dev: `nest build` needs @nestjs/cli and typescript.
step "Building backend"
cd "$ROOT/backend"
npm ci
npm run build

# ── 4. (Re)start under PM2 ───────────────────────────────────────────────────
# Started from backend/ so the app finds backend/.env; PM2 keeps that working
# directory on every restart.
step "Starting app with PM2"
cd "$ROOT/backend"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME"
else
  pm2 start dist/main.js --name "$APP_NAME"
fi
pm2 save >/dev/null

# ── 5. Health check ──────────────────────────────────────────────────────────
# "/" must return the Angular page; a protected API route must answer 401.
step "Checking http://localhost:$PORT"
ok="" web="" api=""
for _ in $(seq 1 30); do
  web="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/" || true)"
  api="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/api/v1/patients" || true)"
  if [ "$web" = "200" ] && [ "$api" = "401" ]; then ok=1; break; fi
  sleep 2
done

if [ -z "$ok" ]; then
  pm2 logs "$APP_NAME" --lines 40 --nostream || true
  fail "app did not come up on port $PORT (frontend=$web, api=$api)"
fi

printf '\n\033[1;32mDeployed - frontend and API are live on port %s\033[0m\n' "$PORT"
