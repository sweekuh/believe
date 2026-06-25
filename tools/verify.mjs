// Render + verify the Believe app with headless Chrome.
//
// Self-contained: starts a tiny static server for the repo root, drives the
// page, asserts the core behaviors, and writes screenshots to tools/shots/.
//
//   node tools/verify.mjs                 # default port 8124, screenshots on
//   node tools/verify.mjs --no-shots      # checks only
//
// Requires: bash tools/setup.sh (installs puppeteer + Chrome) first.
import puppeteer from "puppeteer";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { createReadStream, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, extname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const outDir = join(here, "shots");
const shots = !process.argv.includes("--no-shots");
const port = 8124;

const MIME = {
  ".html": "text/html", ".json": "application/json", ".js": "text/javascript",
  ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml",
};

// --- tiny static file server, scoped to the repo root ---
const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/") p = "/index.html";
    const full = normalize(join(repoRoot, p));
    if (!full.startsWith(repoRoot)) { res.writeHead(403).end(); return; }
    await readFile(full); // throws if missing
    res.writeHead(200, { "content-type": MIME[extname(full)] || "application/octet-stream" });
    createReadStream(full).pipe(res);
  } catch {
    res.writeHead(404).end("not found");
  }
});
await new Promise(r => server.listen(port, r));
const base = `http://localhost:${port}`;

let failures = 0;
const log = (...a) => console.log(...a);
const check = (name, cond) => { log(`${cond ? "PASS" : "FAIL"}  ${name}`); if (!cond) failures++; };

const browser = await puppeteer.launch({
  headless: "shell",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
});
try {
  if (shots) mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });

  // Collect real app errors. Ignore cert failures for the Google Fonts CDNs:
  // those are a sandbox-proxy artifact, not an app bug (the CSS has font fallbacks).
  const errors = [];
  // The app's only cross-origin TLS resources are the two Google Fonts links, so a
  // cert-authority failure is always the sandbox proxy MITMing fonts -- benign here.
  // requestfailed carries the URL; the duplicate console line does not, so match the
  // cert error on its own and also drop the generic console "Failed to load resource".
  const benignCert = t => /ERR_CERT_AUTHORITY_INVALID/.test(t);
  // Cross-origin font fetches to Google's CDNs can fail in a locked-down sandbox
  // in more than one way (bad cert when the proxy MITMs, or a closed/blocked
  // connection when it doesn't) — all are proxy artifacts, not app bugs, since the
  // CSS declares serif/cursive fallbacks. Ignore *any* failure to the two font
  // hosts; surface everything else.
  const fontHost = u => /(googleapis|gstatic)\.com/.test(u);
  page.on("requestfailed", r => {
    const url = r.url(), err = r.failure()?.errorText || "";
    if (fontHost(url)) return;
    errors.push(`${err} ${url}`);
  });
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (benignCert(t) || /^Failed to load resource/.test(t)) return; // covered by requestfailed
    errors.push(t);
  });

  await page.goto(base + "/index.html", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 500));

  check("loads on episode 1", (await page.$eval("#epPicker", el => el.value)) === "1");
  check("cards gated on load", (await page.$eval("#notes", el => el.classList.contains("open"))) === false);
  check("spoiler gate visible on load", (await page.$eval("#gate", el => !el.hidden)));
  if (shots) await page.screenshot({ path: join(outDir, "01-landing.png"), fullPage: true });

  await page.click("#revealBtn");
  await new Promise(r => setTimeout(r, 700));
  check("E1 reveals 5 cards", (await page.$$eval("#notes .card", e => e.length)) === 5);
  check("first card is the BELIEVE sign", /yellow sign/i.test(await page.$eval("#notes .card h2", el => el.textContent)));
  check("cards carry no note box", (await page.$$eval("#notes .yours", e => e.length)) === 0);
  if (shots) await page.screenshot({ path: join(outDir, "02-notes-revealed.png"), fullPage: true });

  // Episode 8 (Season 1): exercises the display contract — weak cards filtered, then
  // a curated reading order (an explicit per-card `order` overrides the interest sort).
  await page.select("#epPicker", "8");
  await new Promise(r => setTimeout(r, 300));
  await page.click("#revealBtn");
  await new Promise(r => setTimeout(r, 500));
  const e8titles = await page.$$eval("#notes .card h2", els => els.map(e => e.textContent.trim()));
  check("E8 shows 5 verified cards", e8titles.length === 5);
  check("E8 leads with the darts scene", e8titles[0] === "The darts scene");
  const iBowie = e8titles.findIndex(t => /Bowie/.test(t));
  const iName = e8titles.findIndex(t => /^Why /.test(t));
  check("E8 curated order introduces Bowie before the name-origin card", iBowie !== -1 && iName !== -1 && iBowie < iName);
  if (shots) await page.screenshot({ path: join(outDir, "04-e8-verified.png"), fullPage: true });

  // Every Season 1 episode now ships verified cards (no "coming soon" placeholders),
  // so a real-content episode must re-gate on switch and reveal its cards on tap.
  await page.select("#epPicker", "2");
  await new Promise(r => setTimeout(r, 400));
  check("E2 title is Biscuits", (await page.$eval("#epTitle", el => el.textContent.trim())) === "Biscuits");
  check("E2 re-gates cards on switch", (await page.$eval("#gate", el => el.hidden)) === false);
  await page.click("#revealBtn");
  await new Promise(r => setTimeout(r, 500));
  const e2titles = await page.$$eval("#notes .card h2", els => els.map(e => e.textContent.trim()));
  check("E2 reveals 5 verified cards", e2titles.length === 5);
  if (shots) await page.screenshot({ path: join(outDir, "03-e2-cards.png"), fullPage: true });

  await page.select("#epPicker", "1");
  await new Promise(r => setTimeout(r, 300));
  check("switching back re-gates the cards", (await page.$eval("#notes", el => !el.classList.contains("open"))));

  // Season picker: two seasons; switching repopulates the episode list and re-gates.
  check("season picker present with 3 seasons (1, 2, 4 teaser)", (await page.$$eval("#seasonPicker option", o => o.length)) === 3);
  check("loads on season 1", (await page.$eval("#seasonPicker", el => el.value)) === "1");
  check("season 1 lists 10 episodes", (await page.$$eval("#epPicker option", o => o.length)) === 10);

  await page.select("#seasonPicker", "2");
  await new Promise(r => setTimeout(r, 300));
  check("season 2 lists 12 episodes", (await page.$$eval("#epPicker option", o => o.length)) === 12);
  check("season 2 jumps to episode 1", (await page.$eval("#epPicker", el => el.value)) === "1");
  check("S2E1 title is Goodbye Earl", (await page.$eval("#epTitle", el => el.textContent.trim())) === "Goodbye Earl");
  check("eyebrow reflects season 2", /Season 2/.test(await page.$eval("#eyebrow", el => el.textContent)));
  check("S2E1 (now written) re-gates its cards", (await page.$eval("#gate", el => el.hidden)) === false);
  await page.click("#revealBtn");
  await new Promise(r => setTimeout(r, 500));
  check("S2E1 reveals 5 verified cards", (await page.$$eval("#notes .card", e => e.length)) === 5);
  if (shots) await page.screenshot({ path: join(outDir, "06-season2.png"), fullPage: true });

  // Both seasons are fully written now, so no shipped episode is a placeholder
  // (the coming-soon path is retained in index.html for future seasons). Confirm
  // the S2 finale, like every episode, re-gates and reveals its cards on tap.
  await page.select("#epPicker", "12");
  await new Promise(r => setTimeout(r, 300));
  check("S2E12 finale title is Inverting the Pyramid of Success", (await page.$eval("#epTitle", el => el.textContent.trim())) === "Inverting the Pyramid of Success");
  check("S2E12 re-gates its cards", (await page.$eval("#gate", el => el.hidden)) === false);
  await page.click("#revealBtn");
  await new Promise(r => setTimeout(r, 500));
  check("S2E12 reveals 5 verified cards", (await page.$$eval("#notes .card", e => e.length)) === 5);

  // Season 4 is a not-yet-aired teaser: selecting it shows the preview immediately
  // (no spoiler gate, since nothing has aired), hides the episode picker, and the
  // eyebrow reads "Coming soon" rather than an episode number.
  await page.select("#seasonPicker", "4");
  await new Promise(r => setTimeout(r, 300));
  check("season 4 hides the episode picker", (await page.$eval("#epPickerField", el => el.hidden)) === true);
  check("season 4 eyebrow reads coming soon", /Coming soon/i.test(await page.$eval("#eyebrow", el => el.textContent)));
  check("season 4 skips the spoiler gate", (await page.$eval("#gate", el => el.hidden)) === true);
  check("season 4 reveals its teaser immediately", (await page.$eval("#notes", el => el.classList.contains("open"))) === true);
  check("season 4 shows 4 teaser cards", (await page.$$eval("#notes .card", e => e.length)) === 4);
  check("season 4 teaser leads with the release date", /August 5/i.test(await page.$eval("#notes .card h2", el => el.textContent)));
  if (shots) await page.screenshot({ path: join(outDir, "07-season4-teaser.png"), fullPage: true });

  // Back to season 1, episode 1 — leaves persisted state clean for the reload checks below.
  await page.select("#seasonPicker", "1");
  await new Promise(r => setTimeout(r, 300));
  check("leaving the teaser restores the episode picker", (await page.$eval("#epPickerField", el => el.hidden)) === false);
  await new Promise(r => setTimeout(r, 300));
  check("switching back to season 1 restores 10 episodes", (await page.$$eval("#epPicker option", o => o.length)) === 10);
  check("season 1 re-gates real-content episode", (await page.$eval("#gate", el => el.hidden)) === false);

  // Display options: panel toggle, text size, high contrast, and persistence
  check("display options panel hidden by default", (await page.$eval("#settingsPanel", el => el.hidden)) === true);
  await page.click("#settingsToggle");
  await new Promise(r => setTimeout(r, 150));
  check("display options toggle reveals the panel", (await page.$eval("#settingsPanel", el => el.hidden)) === false);

  await page.click('.seg-btn[data-scale="1.3"]');
  await new Promise(r => setTimeout(r, 100));
  const scale = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--reader-scale").trim());
  check("text size control sets --reader-scale", scale === "1.3");

  await page.click("#hcToggle");
  await new Promise(r => setTimeout(r, 100));
  check("high contrast adds body.hc", (await page.$eval("body", el => el.classList.contains("hc"))) === true);
  if (shots) await page.screenshot({ path: join(outDir, "05-display-options.png"), fullPage: true });

  await page.reload({ waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 400));
  const scale2 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--reader-scale").trim());
  check("text size persists across reload", scale2 === "1.3");
  check("high contrast persists across reload", (await page.$eval("body", el => el.classList.contains("hc"))) === true);

  check("no app console / network errors", errors.length === 0);
  if (errors.length) log("  errors:", errors);

  log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  if (shots) log(`screenshots in ${outDir}`);
} finally {
  await browser.close();
  server.close();
}
process.exit(failures === 0 ? 0 : 1);
