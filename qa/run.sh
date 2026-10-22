#!/usr/bin/env bash
# Build the site against the local Supabase mock, start it in production mode,
# and run the security and dashboard suites. Needs: Node 20.9+, the site's
# dependencies installed (npm ci at the repo root), and this folder's
# (npm install here, then `npx playwright install chromium` once).
#
#   cd qa && npm test
#
# ⚠ Writes the root .next folder (a production build with the QA settings);
# run `npm run build` again before deploying from this machine.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
set -a; source "$HERE/env.qa"; set +a
export QA_USER="$ADMIN_USERNAME" QA_PASS="$ADMIN_PASSWORD" QA_SVC="$SUPABASE_SERVICE_ROLE_KEY"
APP_PORT="${APP_PORT:-3459}"

rm -rf "$HERE/mock-data"
PORT=54329 MOCK_DATA="$HERE/mock-data" node "$HERE/mock-supabase.mjs" > "$HERE/mock.log" 2>&1 &
MOCK=$!
cleanup() { kill "$MOCK" 2>/dev/null || true; [ -n "${APP:-}" ] && kill -- -"$APP" 2>/dev/null || true; }
trap cleanup EXIT

# `next start` forks a next-server child that outlives a plain `kill`, which
# left the old server on the port: the restart below then failed and the
# dashboard suite ran against it. Each server gets its own process group
# (setsid) and the whole group is stopped.
NEXT="$ROOT/node_modules/.bin/next"
stop_app() { kill -- -"$APP" 2>/dev/null || true; for _ in $(seq 1 40); do curl -s -o /dev/null "http://localhost:$APP_PORT/" || break; sleep 0.25; done; }

cd "$ROOT"
echo "Building the site against the mock..."
npx next build > "$HERE/build.log" 2>&1 || { tail -40 "$HERE/build.log"; exit 1; }
setsid "$NEXT" start -p "$APP_PORT" > "$HERE/server.log" 2>&1 &
APP=$!
for _ in $(seq 1 60); do curl -s -o /dev/null "http://localhost:$APP_PORT/" && break; sleep 0.5; done

echo; echo "== Security"; node "$HERE/security.mjs" "http://localhost:$APP_PORT"
echo; echo "== Dashboard workflows"; curl -s "http://127.0.0.1:54329/__reset" > /dev/null
# The server remembers buckets it created; restart it so the reset is seen.
stop_app; setsid "$NEXT" start -p "$APP_PORT" > "$HERE/server.log" 2>&1 & APP=$!
for _ in $(seq 1 60); do curl -s -o /dev/null "http://localhost:$APP_PORT/" && break; sleep 0.5; done
node "$HERE/cms-e2e.mjs" "http://localhost:$APP_PORT"
echo; echo "All QA suites passed."
