# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Believe" is a **static, single-purpose gift app**: a Ted Lasso philosophy
companion for one non-technical reader (the author's mom), rewatching Season 1
on her phone. It is plain HTML/CSS/vanilla JS — **no backend, no build step, no
framework, no npm in the shipped site.** All content lives in `episodes.json`;
the app is `index.html`. It deploys as-is to GitHub Pages.

Treat the gift framing as a hard constraint, not flavor text. The cardinal rule:
**a wrong philosophical attribution is worse than a missing one.** Never invent
philosophy or plot facts to fill an episode.

## Architecture (the parts that span files)

- **`index.html`** is the whole app: one IIFE `fetch`es `./episodes.json`, builds
  the season + episode `<select>`s, and renders cards into the prototype's markup.
  Key behaviors that are easy to break:
  - **Two-level picker**: a **season** `<select>` and an **episode** `<select>`.
    Changing the season repopulates the episode list and jumps to its first
    episode (`selectSeason()` → `buildEpisodePicker()` → `selectEpisode()`). The
    last-viewed season *and* episode persist (`believe:lastSeason` /
    `believe:lastEpisode`) and are both restored on load.
  - **Re-gate on every episode switch** — a new episode's cards stay hidden
    behind the spoiler button until tapped. `selectEpisode()` resets this.
  - **Display contract** (`displayCards()` + the `GROUNDING_MIN` /
    `DEFAULT_INTEREST` constants at the top of the script): cards with
    `grounding` < 3 are **withheld from the reader**. Order is **curated per
    episode** when any card carries an integer `order` (ascending, so a page
    reads intros-before-the-cards-that-reference-them); episodes with no `order`
    fall back to **most-interesting-first** (`interest`). Ties break by interest
    then original index. Backward-compatible — unscored/unordered cards sort
    neutrally.
  - Notes persist in `localStorage` keyed `believe:note:{card.id}`, so **card
    `id`s are stable and must never be reused/reindexed.**
  - **Display options** (`setupDisplayOptions()`): a "Display options" panel
    offers a text-size control (multiplies the `--reader-scale` CSS var, which
    scales only the *reading* text — card prose/title/source, intros, note box —
    not chrome) and a high-contrast toggle (`body.hc`, an opt-in dark variant
    that deepens the dusk palette and brightens muted text). Persisted in
    `believe:fontScale` (`1`/`1.15`/`1.3`) and `believe:contrast` (`0`/`1`).
    Wired before the `fetch`, so they work even on a load error.
  - Rich card fields (`title`/`moment`/`idea`/`why`/`source`) are injected as
    HTML to keep inline `<em>`/`<strong>`; content is author-trusted.
- **`design-reference/believe-s1e1.html`** is the approved visual source of
  truth. Match it exactly; do not redesign. Design tokens and the taped BELIEVE
  banner / torn-paper cards live here and are mirrored in `index.html`. It
  reflects the **default** theme + text size (high contrast off, scale 1); the
  display options layer on top of that baseline and aren't in the reference.
- **`episodes.json`** is the only content file. Its top level is
  `{ show, fromMom, seasons: [ { season, episodes: [...] } ] }` — a `seasons`
  array, each holding that season's `episodes`. (The app also tolerates a legacy
  single-season `{ season, episodes }` file via `normalizeData()`.) Card schema
  and the optional scoring fields (`grounding`, `interest`, `category`,
  `groundingStatus`, `groundingNotes`, `sourcesChecked`) are documented in
  `README.md` and `docs/facts-schema.md`. Both seasons are fully written
  (Season 1: 10 episodes; Season 2: 12 episodes; ~5 verified cards each, built
  through the content pipeline). The "coming soon" placeholder path stays in the
  app for any future season.

## Content pipeline (how cards get written)

Do **not** hand-write episode philosophy directly into `episodes.json`. The
process is intentionally split (see `docs/facts-schema.md`, the binding
contract):

1. **`/episode-fact-hunter <ep>`** (skill) — breadth/discovery → `research/<ep>.candidates.json` (unverified).
2. **`/grounding-reviewer <ep>`** (skill) — independently re-verifies each claim
   from primary sources via web, scores (`grounding`/`insight`/`surprise`/
   `relevance`/`spoiler_safety`), computes `interest_score`
   (`7*insight + 7*surprise + 4*relevance + 2*spoiler_safety`), gates inclusion
   (default threshold 60), and drafts ready-to-paste cards →
   `research/<ep>.reviewed.json`. It never edits `episodes.json`.
3. A human promotes `include: true` cards into `episodes.json`.

`docs/factsheet.md` is the sourced research scratch pad the hunter reuses.

## Commands

This repo has no test/lint suite. Verification is a headless-browser script.

```bash
# Serve the app locally (fetch('./episodes.json') is CORS-blocked on file://)
python3 -m http.server 8000          # then open http://localhost:8000

# Headless-browser verification (asserts gate, reveal, notes, copy-all,
# display-contract sort/filter, display options; writes screenshots to tools/shots/)
bash tools/setup.sh                  # first run per container: installs Puppeteer + Chrome
node tools/verify.mjs                # run all checks (currently 37)
node tools/verify.mjs --no-shots     # checks only, no screenshots

# Validate content
python3 -c "import json; json.load(open('episodes.json'))"
```

## Environment notes (Claude Code on the web)

- The container is **ephemeral** and its network is **locked down**: npm, PyPI,
  github.com, and Google's Chrome-for-Testing bucket are reachable; Playwright's
  CDN and apt mirrors are **not**. Puppeteer works because it pulls Chrome from
  the reachable bucket — `playwright install` and `apt-get install chromium` do not.
- `.claude/hooks/session-start.sh` (registered in `.claude/settings.json`)
  reinstalls the headless browser on each web session (remote-only, idempotent).
- The harness-side **WebSearch/WebFetch** tools DO reach the open web even though
  the container browser is firewalled — that is what the grounding-reviewer skill
  relies on for fact-checking.
- `tools/` is dev-only (gitignored `node_modules`); it never ships to Pages.

## Hard rules when editing

- Paraphrase the show; **never reproduce dialogue** (any source quote < 15 words).
- Verify every attribution before it ships; withhold rather than inflate. The
  standing example is "be curious, not judgmental" — credited to Whitman in the
  show but a documented misattribution ("attributed to, not by").
- Mobile-first: test at 375px; keep tap targets ≥ 44px; honor
  `prefers-reduced-motion` and `:focus-visible`.
- Keep the shipped site dependency-free and static.
