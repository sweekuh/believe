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
  page.on("requestfailed", r => {
    const url = r.url(), err = r.failure()?.errorText || "";
    if (benignCert(err) && /(googleapis|gstatic)\.com/.test(url)) return;
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
  check("each real card has a note box", (await page.$$eval("#notes .yours textarea", e => e.length)) === 5);
  if (shots) await page.screenshot({ path: join(outDir, "02-notes-revealed.png"), fullPage: true });

  await page.type("#notes .card textarea", "This one got me, Teddy.");
  await page.click("#notes .card .yours button");
  await new Promise(r => setTimeout(r, 300));
  await page.reload({ waitUntil: "networkidle0" });
  await page.click("#revealBtn");
  await new Promise(r => setTimeout(r, 500));
  check("note persists across reload", (await page.$eval("#notes .card textarea", el => el.value)) === "This one got me, Teddy.");

  const clip = await page.evaluate(async () => {
    let cap = ""; navigator.clipboard.writeText = async t => { cap = t; };
    document.getElementById("copyAllBtn").click();
    await new Promise(r => setTimeout(r, 100)); return cap;
  });
  check("copy-all includes the saved note", /This one got me, Teddy\./.test(clip));

  // Episode 8: scored cards exercise the display contract (filter + sort by interest)
  await page.select("#epPicker", "8");
  await new Promise(r => setTimeout(r, 300));
  await page.click("#revealBtn");
  await new Promise(r => setTimeout(r, 500));
  const e8titles = await page.$$eval("#notes .card h2", els => els.map(e => e.textContent.trim()));
  check("E8 shows 2 verified cards", e8titles.length === 2);
  check("E8 sorts most-interesting first (darts before Diamond Dogs)", e8titles[0] === "The darts scene");
  if (shots) await page.screenshot({ path: join(outDir, "04-e8-verified.png"), fullPage: true });

  await page.select("#epPicker", "2");
  await new Promise(r => setTimeout(r, 400));
  check("E2 title is Biscuits", (await page.$eval("#epTitle", el => el.textContent.trim())) === "Biscuits");
  check("E2 shows Coming soon placeholder", /coming soon/i.test(await page.$eval("#notes .card .tag", el => el.textContent)));
  check("placeholder episode skips the gate", (await page.$eval("#gate", el => el.hidden)) === true);
  if (shots) await page.screenshot({ path: join(outDir, "03-placeholder-e2.png"), fullPage: true });

  await page.select("#epPicker", "1");
  await new Promise(r => setTimeout(r, 300));
  check("switching back re-gates the cards", (await page.$eval("#notes", el => !el.classList.contains("open"))));

  check("no app console / network errors", errors.length === 0);
  if (errors.length) log("  errors:", errors);

  log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  if (shots) log(`screenshots in ${outDir}`);
} finally {
  await browser.close();
  server.close();
}
process.exit(failures === 0 ? 0 : 1);
