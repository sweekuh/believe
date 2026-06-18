#!/bin/bash
# SessionStart hook: make the headless-browser verifier usable in Claude Code
# on the web. The remote container is ephemeral, so the browser must be (re)installed
# per fresh container. This installs Puppeteer + Chrome (from Google's Chrome-for-Testing
# bucket, the one browser source reachable behind the locked-down network).
#
# Synchronous: the session waits until this finishes, so `node tools/verify.mjs`
# is ready to run immediately. Switch to async by uncommenting the line below.
set -euo pipefail

# Only run in the remote (web) environment; do nothing for local CLI sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# --- async mode (optional): uncomment to start the session without waiting ---
# echo '{"async": true, "asyncTimeout": 300000}'

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
TOOLS_DIR="$PROJECT_DIR/tools"

# If the verifier tooling isn't in this checkout, there's nothing to set up.
[ -d "$TOOLS_DIR" ] || { echo "session-start: no tools/ directory, skipping"; exit 0; }
cd "$TOOLS_DIR"

# Install Puppeteer if missing (idempotent; container state is cached after the hook).
if [ ! -d node_modules/puppeteer ]; then
  echo "session-start: installing puppeteer..."
  npm install --no-audit --no-fund
else
  echo "session-start: puppeteer already installed"
fi

# Ensure the Chrome binary is present (no-op if already downloaded/cached).
echo "session-start: ensuring Chrome is installed..."
npx --yes puppeteer browsers install chrome

echo "session-start: headless browser ready (run: node tools/verify.mjs)"
