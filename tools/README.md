# tools/ — headless-browser verification (dev only)

This folder is **not part of the shipped app**. GitHub Pages still serves a
plain static site (`index.html` + `episodes.json`); nothing here runs in
production or is needed to deploy. It exists so a Claude remote session (or you
locally) can render the app in a real browser and assert it behaves.

## Why it's set up this oddly

The Claude remote container is ephemeral and its outbound network is locked
down. The usual ways to get a headless browser are **blocked** here:

- `playwright install` → fails (Playwright's CDN `cdn.playwright.dev` is blocked)
- Puppeteer's bundled download → **works**, because Puppeteer pulls Chrome from
  Google's **Chrome-for-Testing** bucket
  (`storage.googleapis.com/chrome-for-testing-public`), which *is* reachable.
- `apt-get install chromium` → fails (Debian/Ubuntu mirrors are blocked)

So the supported path is Puppeteer. All the system shared libraries Chrome
needs (libnss3, libgbm, libxkbcommon, gtk, etc.) are already present on the
image, so no apt step is required.

## Use it

```bash
bash tools/setup.sh        # installs puppeteer + Chrome (first time, ~1 min)
node tools/verify.mjs      # serves the repo, runs checks, writes tools/shots/*.png
node tools/verify.mjs --no-shots   # checks only, no screenshots
```

`verify.mjs` starts its own static server (so `fetch('./episodes.json')` works —
opening `file://` directly would be blocked by CORS), drives the page at 375px
mobile width, and asserts: gated-on-load, reveal shows 5 E1 cards, notes persist
across reload, copy-all captures notes, placeholder episodes skip the gate, and
switching episodes re-gates.

## Known benign noise

In the sandbox, Google Fonts (`fonts.googleapis.com` / `gstatic.com`) is behind
a TLS-intercepting proxy, so Chrome logs `ERR_CERT_AUTHORITY_INVALID` for the
font requests and the screenshots fall back to system serif/sans fonts. That is
an environment artifact, not an app bug — fonts load normally on a real phone,
and the CSS declares fallbacks. `verify.mjs` filters these out of its error
check; everything else must be clean.
