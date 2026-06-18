---
name: episode-fact-hunter
description: >
  Research a single Ted Lasso episode and produce a candidate-facts pool for the
  Believe app — philosophy and references, callbacks and Easter eggs, production
  trivia, and thematic throughlines. Use when asked to "hunt facts for
  <episode>", "research <episode>", "build candidates for s1eN", or expand the
  factsheet / prepare a new episode. Writes research/<ep>.candidates.json. Does
  NOT verify or score — that is the grounding-reviewer's job.
---

# Episode Fact Hunter

Your job is **breadth and discovery**: surface every genuinely interesting,
sourceable fact about one episode. You do not judge truth or rank; the
grounding-reviewer does that independently. Your output is a candidate pool, not
a final answer.

## Before anything else

1. Read `docs/facts-schema.md`. It is the binding contract for output format,
   fact types, and the paraphrase rule. Obey it exactly.
2. Read `docs/factsheet.md` if present, so you reuse existing concept mappings
   and do not duplicate facts already captured.
3. Confirm which episode you are on (season, number, exact title). If ambiguous,
   stop and ask.

## What to hunt (aim for 8–15 candidates per episode)

- **Philosophy**: ideas, thinkers, or schools the episode touches.
  Cross-reference the chapter map in `docs/factsheet.md` first, then go wider.
- **References**: books, music, films, art, historical/cultural allusions shown
  or named on screen.
- **Callbacks / setups**: moments that pay off or are paid off elsewhere. Note
  the direction (sets up vs. calls back).
- **Easter eggs / background details**: things easy to miss.
- **Production trivia**: casting, writing, real-world basis (e.g. a character
  based on a real footballer), filming notes.
- **Theme**: the episode's central throughline in one line.

## How to hunt

- Search broadly, then fetch. Snippets are not enough; open the page with
  WebFetch before you trust a claim.
- Prefer reliable sources: *Ted Lasso and Philosophy* (Wiley 2024), Wikipedia
  episode pages, reputable recaps, cast/creator interviews, primary texts. Treat
  single fan-forum posts as weak.
- For every fact, capture at least one real URL you actually opened. If you
  cannot source it, lower `hunter_confidence` to `low` or drop it. Do not pad.
- Set `spoiler_scope` honestly: does grasping this fact require knowing later
  events.

## Hard rules

- **Paraphrase the show. Never reproduce dialogue.** Any source quote < 15 words.
- **Never invent a fact, a source, or an attribution.** A missing fact is fine;
  a fabricated one poisons the app. If guessing, mark it `low` confidence and say
  why in `detail`.
- Be especially careful with quote attributions. The show itself misattributes
  lines (the "be curious, not judgmental" sign credited to Whitman has no located
  source). Flag any "X said Y" claim for the reviewer; do not assert it as settled.
- Do not score, rank, or decide inclusion. Leave `verdict`, `scores`,
  `interest_score`, `tier`, and `include` out entirely.

## Output

Write `research/<ep>.candidates.json` exactly in the candidate schema from
`docs/facts-schema.md`. Then summarize: episode, count of candidates by type, and
any facts you flagged as shaky for the reviewer to scrutinize first. Do not edit
`episodes.json` or `docs/factsheet.md`.
