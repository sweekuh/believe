# Design Review & Consultation — *Believe*

A design review of the Believe app (`index.html`), measured against its one
job: being **easy and lovely to read on a phone for one non-technical reader**
(the author's mom), rewatching Ted Lasso Season 1.

Reviewed at 375px (the target width) using the headless-browser screenshots in
`tools/shots/`, plus a read of `index.html` and `design-reference/believe-s1e1.html`.

> **Framing.** `design-reference/believe-s1e1.html` is the approved visual
> source of truth — the taped BELIEVE banner, torn-paper cards, and
> locker-room-at-dusk palette are deliberate and should not be redesigned. So
> this review separates **legibility/accessibility fixes** (which keep that
> aesthetic intact and are the audience's real need) from **larger proposals**
> the author should approve before they ship.

---

## Who we're designing for

- **One reader.** Older, non-technical, on a phone, often reading a few cards
  right after finishing an episode on the same device.
- **Reading, not operating.** The interface should disappear; the words and the
  warmth should be the only things she notices.
- **Loss-averse moments matter.** Her own notes live only in this browser. The
  one piece of "system" information she must not miss is *how to back them up*.
- **Comprehension > cleverness.** A wrong philosophical attribution is worse
  than a missing one (project cardinal rule), and the same spirit applies to
  the UI: clarity beats flourish.

---

## What's working well (keep it)

- **Strong, coherent identity.** The taped banner, torn-paper cards with tape
  tabs, and dusk gradient read instantly as "a personal, handmade gift," not a
  web app. This is the product's soul — protect it.
- **The spoiler gate is the right call.** Nothing is revealed until she taps "I've
  watched it," and switching episodes correctly re-gates. This respects how she
  actually uses it (read *after* watching).
- **Personal-note box is genuinely thoughtful.** The pink "Your note, Mom" box,
  save-on-blur + Save button, and season-wide "Copy all my notes" backup are a
  lovely, human touch and technically sound (notes keyed by stable `card.id`).
- **Solid accessibility baseline.** `prefers-reduced-motion` is honored,
  `:focus-visible` outlines exist everywhere, tap targets are ≥44–48px, the
  banner has an `aria-label`, and `aria-expanded`/`aria-controls` wire the gate
  to the notes. Good foundation.
- **Graceful failure.** A network/parse error shows a plain, kind message and
  hides the gate rather than leaving a blank screen.

---

## Findings, by priority

> **Status:** all findings below are now **implemented** (the author asked to
> follow every recommendation). The visual changes (#4, #5, #8) are mirrored
> into `design-reference/believe-s1e1.html` so the approved source of truth and
> the shipped app stay in sync. All 15 headless checks still pass.

### Tier 1 — legibility / accessibility corrections (aesthetic-preserving)

1. **Source line failed contrast (WCAG AA).** `.src` was `#8a7d68` on the cream
   card — ≈**3.3:1**, below the 4.5:1 minimum for body text, and it's the
   smallest text on the card. Darkened to `#6b5f4c` (≈**5:1**) and the link to
   `#5a4a2e`. *Fix:* legibility of citations, which an attentive reader will
   actually want to follow.

2. **The backup tip was the smallest, faintest text on the page.** The
   "your notes are saved on this phone… Copy all my notes is your backup"
   line — the single most important system message for a loss-averse user — was
   12.5px at `#7e8ea3` (≈4.7:1, borderline). Bumped to 13.5px and lightened to
   `#9aaabf` for clearer contrast against the dark background.

3. **Orphan dash under the Biscuits card.** That card's `source` is a lone "—"
   (an author placeholder for "no citation"), which rendered as a stray dash
   floating under the card. `buildCard()` now treats a dash-only source as
   empty, so nothing renders. Backward-compatible; real citations are
   unaffected.

### Tier 2 — readability tuning for the actual reader

4. **Body text bumped for older eyes.** Body went **19px → 20px** Newsreader,
   reducing strain with no layout harm on the 620px column. Mirrored into the
   design reference.

5. **The two italic serif intro blocks are now easier to read.** `.from-me`
   ("Hi Mom…") and `.ep-intro` were italic serif in a muted blue (`#cdd7e3`) —
   italic body runs are the toughest for aging eyes. Kept the *voice* but raised
   line-height to **1.7** and brightened the color to **`#dde6ef`**. `.from-me`
   mirrored into the design reference.

6. **"Saved ✓" now announces to assistive tech.** The confirmation was a visual
   fade only. The `.saved` span now carries `role="status"`, and its text is set
   on each save and cleared on fade-out, so the live region re-announces every
   save (mirroring how the copy-all status already works).

### Tier 3 — guidance / polish

7. **Picker label is more guiding.** "Pick an episode" → **"Pick the episode you
   just watched"**, reinforcing the read-after-watching model for a first-time,
   non-technical user (label text and the select's `aria-label`).

8. **Reveal button no longer wraps.** Shortened "I've watched it — show me the
   notes" → **"I've watched it — show the notes"**, which fits on one line at
   375px. Mirrored into the design reference.

9. **Notes section no longer over-announces.** Removed `aria-live="polite"` from
   the `#notes` container so revealing five cards doesn't read them all at once.
   The reveal is user-initiated and the button's `aria-expanded` /
   `aria-controls` already convey that the content expanded.

### Noted, no change needed

10. **Google Fonts dependency.** The shipped site pulls Permanent Marker /
    Fraunces / Newsreader / Inter from Google. Fallbacks exist (`Georgia`,
    generic `serif`/`sans-serif`), so a blocked CDN degrades gracefully — but
    the handmade character leans on Permanent Marker (the banner) and Fraunces
    (titles). Acceptable for a static gift; just a known external dependency.

---

## Reader-facing accessibility options (added)

A small **"⚙ Display options"** toggle (top of the page, tucked behind one tap)
opens a panel with two controls. Both default to the current look, persist per
browser, and are wired before the data `fetch` so they work even if content
fails to load.

- **Text size — Normal / Larger / Largest.** Multiplies a single
  `--reader-scale` CSS variable (1 / 1.15 / 1.3) applied via `calc()` to the
  *reading* text only — card prose, card titles, the "Hi Mom" / episode intros,
  the source line, and her own note box. Chrome (banner, picker, eyebrow, tags,
  buttons) stays a fixed size so layout is stable at every scale.
  Saved in `believe:fontScale`.
- **High contrast — Off / On.** An opt-in `body.hc` variant that *keeps the dark
  dusk aesthetic* (per the chosen direction) but deepens the background, darkens
  the marker ink on the cream cards, brightens the muted-blue UI text, deepens
  the pitch-green tag/accent, and adds a faint card edge. Saved in
  `believe:contrast`. *Why this over a light mode:* it's the option closest to
  the approved look while still delivering a real contrast gain.

Both are exposed semantically: the text-size buttons are an
`aria-pressed` group, high contrast is a `role="switch"` with `aria-checked`,
the toggle uses `aria-expanded`/`aria-controls`, and every control is a ≥44px
tap target with a `:focus-visible` outline.

> The design reference shows the **default** baseline (high contrast off, scale
> 1); these options layer on top and are intentionally not added to the
> reference prototype.

## Accessibility snapshot

| Area | Status |
|------|--------|
| Tap targets ≥44px | ✅ buttons 44–48px, select 48px, display controls 44px |
| `prefers-reduced-motion` | ✅ honored (gate animation, card tilt, smooth-scroll) |
| `:focus-visible` outlines | ✅ on select, reveal, save, copy-all, textarea, display controls |
| Text contrast on dark bg | ✅ after note-tip fix; muted blues (`#9fb2c9`) pass; high-contrast option for more |
| Text contrast on cards | ✅ after `.src` fix (was the one failure) |
| Semantic gate wiring | ✅ `aria-expanded` / `aria-controls` / `aria-hidden` |
| Save confirmation announced | ✅ `role="status"` live region (fix #6) |
| Reader text scaling | ✅ Normal / Larger / Largest, persisted |
| Theme contrast control | ✅ opt-in high-contrast dark variant, persisted |
| Language / viewport meta | ✅ `lang="en"`, responsive viewport |

---

## Verifying design changes

The headless harness doubles as a visual-regression aid:

```bash
node tools/verify.mjs            # 21 behavior checks + writes tools/shots/*.png
node tools/verify.mjs --no-shots # checks only
```

Screenshots are captured at 375px (the target). Eyeball `01-landing.png`,
`02-notes-revealed.png`, `03-placeholder-e2.png`, `04-e8-verified.png`, and
`05-display-options.png` (text size + high contrast) after any styling change.

---

## Summary

The design is in good shape and true to its purpose — warm, personal, and
restrained. It did not need a redesign; it needed **legibility tuning for the
specific person reading it.** All nine findings are now implemented — contrast
and orphan-dash fixes, a body-text bump, calmer intro typography, a guiding
picker label, a one-line reveal button, and two screen-reader corrections — with
the visual changes mirrored into the design reference. The Google-Fonts
dependency (#10) is a noted, acceptable trade-off for a static gift. On top of
the review, reader-facing **display options** (text size + an opt-in
high-contrast dark variant) were added behind a small toggle. All 21 headless
checks pass.
