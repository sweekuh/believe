# research/

Working files for the fact pipeline (see `docs/facts-schema.md`):

- `s{season}e{episode}.candidates.json` — written by **episode-fact-hunter**
  (breadth; unverified).
- `s{season}e{episode}.reviewed.json` — written by **grounding-reviewer**
  (independently verified, scored, ranked, with drafted cards).

These are the **audit trail** — commit them. The reviewer never edits the
candidates file, so the chain from raw lead → verdict → shipped card stays
inspectable. Cards with `include: true` in a `.reviewed.json` are what a human
promotes into `episodes.json`.

To run the pipeline from Claude Code:

> hunt facts for s1e2
> review s1e2

The E3/E8/E9 cards already in `episodes.json` were verified by an equivalent
ad-hoc review (grounding 5, sourced); their formal `.candidates`/`.reviewed`
files can be backfilled if you want the full audit trail for them too.
