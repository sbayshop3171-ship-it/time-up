#!/usr/bin/env bash

set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BRANCH="${DEPLOY_BRANCH:-main}"
SKIP_FETCH="${SKIP_FETCH:-0}"
PORT="${PORT:-3001}"
HOST="${HOST:-0.0.0.0}"
PM2_APP_NAME="${PM2_APP_NAME:-time-up}"
NPM_BIN="${NPM_BIN:-npm}"
PM2_BIN="${PM2_BIN:-pm2}"
LOG_DIR="${DEPLOY_LOG_DIR:-$REPO_DIR/logs}"
STATE_FILE="${DEPLOY_STATE_FILE:-$REPO_DIR/.last_deployed_commit}"

mkdir -p "$LOG_DIR"
exec >>"$LOG_DIR/deploy.log" 2>&1

echo
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting deploy for $PM2_APP_NAME"

cd "$REPO_DIR"

IS_GIT_WORK_TREE=0
CURRENT_SHA="${DEPLOY_COMMIT:-}"
TARGET_SHA="${DEPLOY_COMMIT:-}"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  IS_GIT_WORK_TREE=1
  CURRENT_SHA="$(git rev-parse HEAD)"
elif [[ "$SKIP_FETCH" != "1" || -z "$TARGET_SHA" ]]; then
  echo "Repository is not initialized in $REPO_DIR"
  exit 1
fi

if [[ "$SKIP_FETCH" == "1" ]]; then
  TARGET_SHA="${TARGET_SHA:-$CURRENT_SHA}"
else
  git fetch origin "$BRANCH"
  TARGET_SHA="$(git rev-parse "origin/$BRANCH")"
fi

LAST_DEPLOYED_SHA=""
if [[ -f "$STATE_FILE" ]]; then
  LAST_DEPLOYED_SHA="$(tr -d '[:space:]' < "$STATE_FILE")"
fi

if [[ "$IS_GIT_WORK_TREE" == "1" && "$CURRENT_SHA" != "$TARGET_SHA" ]]; then
  echo "Updating $CURRENT_SHA -> $TARGET_SHA"
  git reset --hard "$TARGET_SHA"
elif [[ "$LAST_DEPLOYED_SHA" == "$TARGET_SHA" && -d "$REPO_DIR/.next" ]]; then
  echo "No new commit. Current: $CURRENT_SHA"
  exit 0
fi

if [[ ! -f "$REPO_DIR/.env.local" ]]; then
  echo "Warning: .env.local is missing. Runtime-only secrets and launch URLs may be empty."
fi

"$NPM_BIN" ci
"$NPM_BIN" run build

if "$PM2_BIN" describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  PORT="$PORT" HOST="$HOST" "$PM2_BIN" restart "$PM2_APP_NAME" --update-env
else
  PORT="$PORT" HOST="$HOST" "$PM2_BIN" start "$NPM_BIN" \
    --name "$PM2_APP_NAME" \
    -- start -- -p "$PORT" -H "$HOST"
fi

"$PM2_BIN" save || true

printf '%s\n' "$TARGET_SHA" > "$STATE_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy completed at $TARGET_SHA on port $PORT"
