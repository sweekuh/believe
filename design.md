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

### Implemented in this review (safe, aesthetic-preserving)

These are corrections, not redesigns — the look is unchanged to the eye, but
the text is easier to read.

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

All 15 headless checks still pass after these changes.

### Recommended (worth doing; low risk — needs a yes)

4. **Nudge the body text up for older eyes.** Body is 19px Newsreader. For the
   actual reader, **20–21px** would meaningfully reduce strain with no layout
   harm on a 620px column. *Why it's flagged, not done:* it's the one change
   that shifts the look slightly, and the design reference is the approved
   baseline. Recommend bumping `body{font-size}` to **20px** (and mirroring it
   in the reference so the two files stay in sync). One-line change.

5. **The two italic serif intro blocks are the hardest text to read.**
   `.from-me` ("Hi Mom…") and `.ep-intro` are italic serif in a muted blue
   (`#cdd7e3`) — italic body runs are the toughest for aging eyes. Keep the
   *voice* (it's clearly Zach speaking), but consider raising line-height to
   ~1.7 and/or nudging the color brighter. They're short, so impact is small,
   but it's the first thing she reads.

6. **"Saved ✓" isn't announced to assistive tech.** The confirmation is a
   visual fade only. If screen-reader support matters, add `role="status"`
   (or `aria-live="polite"`) to the `.saved` span so the confirmation is spoken.
   The copy-all status already does this correctly — mirror it.

### Consider (nice-to-have / future)

7. **Picker label is a bit terse.** "Pick an episode" works, but a hair more
   guidance ("Pick the episode you just watched") reinforces the read-after-
   watching model for a first-time, non-technical user. Optional.

8. **Long reveal-button label wraps to two lines** at 375px
   ("I've watched it — show me the notes"). It's legible and tappable, so this
   is cosmetic; if it bothers the author, shorten to "I've watched it — show the
   notes."

9. **Notes section uses `aria-live="polite"` on the whole container.** When
   revealed, a screen reader may announce all five cards at once. For her this
   is almost certainly moot, but if SR polish is ever a goal, move the live
   region off the bulk-content container.

10. **Google Fonts dependency.** The shipped site pulls Permanent Marker /
    Fraunces / Newsreader / Inter from Google. Fallbacks exist (`Georgia`,
    generic `serif`/`sans-serif`), so a blocked CDN degrades gracefully — but
    the handmade character leans on Permanent Marker (the banner) and Fraunces
    (titles). Acceptable for a static gift; just a known external dependency.

---

## Accessibility snapshot

| Area | Status |
|------|--------|
| Tap targets ≥44px | ✅ buttons 44–48px, select 48px |
| `prefers-reduced-motion` | ✅ honored (gate animation, card tilt, smooth-scroll) |
| `:focus-visible` outlines | ✅ on select, reveal, save, copy-all, textarea |
| Text contrast on dark bg | ✅ after note-tip fix; muted blues (`#9fb2c9`) pass |
| Text contrast on cards | ✅ after `.src` fix (was the one failure) |
| Semantic gate wiring | ✅ `aria-expanded` / `aria-controls` / `aria-hidden` |
| Save confirmation announced | ⚠️ visual only — see rec #6 |
| Language / viewport meta | ✅ `lang="en"`, responsive viewport |

---

## Verifying design changes

The headless harness doubles as a visual-regression aid:

```bash
node tools/verify.mjs            # 15 behavior checks + writes tools/shots/*.png
node tools/verify.mjs --no-shots # checks only
```

Screenshots are captured at 375px (the target). Eyeball `01-landing.png`,
`02-notes-revealed.png`, `03-placeholder-e2.png`, and `04-e8-verified.png`
after any styling change.

---

## Summary

The design is in good shape and true to its purpose — warm, personal, and
restrained. It did not need a redesign; it needed **legibility tuning for the
specific person reading it.** This review shipped three safe fixes (citation
contrast, backup-tip legibility, orphan-dash cleanup) and leaves a short,
prioritized list — led by a modest body-text bump — for the author to approve.
