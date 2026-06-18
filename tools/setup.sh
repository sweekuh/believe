#!/usr/bin/env bash
# Set up a headless Chrome for verifying the Believe app in a Claude remote session.
#
# Why this script exists: the remote container is ephemeral and its network is
# locked down. Playwright's CDN (cdn.playwright.dev) is blocked, but Google's
# Chrome-for-Testing storage bucket (storage.googleapis.com/chrome-for-testing-public)
# IS reachable -- and that's exactly where Puppeteer fetches its browser from.
# So `npm install puppeteer` works here even though `playwright install` does not.
#
# Usage:  bash tools/setup.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "Installing puppeteer (pulls Chrome from the reachable Chrome-for-Testing bucket)..."
npm install

echo "Ensuring the Chrome binary is present..."
npx puppeteer browsers install chrome

echo
echo "Done. Verify the app with:"
echo "  node tools/verify.mjs            # serves ../ , runs checks, writes screenshots to tools/shots/"
