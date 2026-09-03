#!/usr/bin/env bash

set -euo pipefail

REMOTE_NAME="${1:-origin}"
GITHUB_PUSH_URL="${GITHUB_PUSH_URL:-git@github.com:sbayshop3171-ship-it/time-up.git}"
LIVE_PUSH_URL="${LIVE_PUSH_URL:-astbgs-live:/var/www/tafsir/data/git/time-up.git}"

git remote set-url --delete --push "$REMOTE_NAME" "$GITHUB_PUSH_URL" 2>/dev/null || true
git remote set-url --delete --push "$REMOTE_NAME" "$LIVE_PUSH_URL" 2>/dev/null || true
git remote set-url --add --push "$REMOTE_NAME" "$GITHUB_PUSH_URL"
git remote set-url --add --push "$REMOTE_NAME" "$LIVE_PUSH_URL"

git remote -v
