# Facts schema — the binding contract for the research pipeline

Two skills (`.claude/skills/`) turn an episode into shippable cards, with an
independent verification step in the middle:

```
episode-fact-hunter        grounding-reviewer                 (human / curation)
  breadth & discovery   →    independent verify + score   →     promote included
  research/<ep>.candidates.json   research/<ep>.reviewed.json    cards into episodes.json
```

- The **hunter** gathers a wide candidate pool. It does **not** judge truth,
  score, or rank.
- The **reviewer** independently re-verifies every claim from primary sources,
  scores and ranks what survives, gates inclusion, and drafts a ready-to-paste
  `card` for each included fact. It never edits the candidates file (preserve
  the audit trail) and never edits `episodes.json`.
- A final human/curation step pastes `include: true` cards into `episodes.json`.

`<ep>` is `s{season}e{episode}` with no zero-padding, e.g. `s1e8`. Files live in
`research/` at the repo root.

---

## Fact `type` vocabulary

One of: `philosophy` · `callback` · `reference` · `trivia` · `easter-egg` ·
`theme` · `production`.

---

## Candidate schema (hunter output: `research/<ep>.candidates.json`)

```json
{
  "episode": { "season": 1, "number": 8, "title": "The Diamond Dogs" },
  "generated_by": "episode-fact-hunter",
  "candidates": [
    {
      "id": "s1e8-darts-curiosity",
      "type": "philosophy",
      "title": "Short label for the moment",
      "detail": "What the fact is, in plain prose.",
      "moment": "Paraphrase of the on-screen moment. Never reproduce dialogue.",
      "sources": [ { "url": "https://…", "note": "what this lead supports" } ],
      "hunter_confidence": "low | medium | high",
      "spoiler_scope": "self | season | series"
    }
  ]
}
```

- `id` is the stable card id (`s{season}e{episode}-{slug}`); reuse it downstream.
- `sources` are **leads to check**, not proof.
- `spoiler_scope`: does understanding the fact require knowing later events —
  `self` (this episode only), `season`, or `series`.
- Aim for 8–15 candidates. Do not pad; drop what you cannot source.

---

## Reviewed schema (reviewer output: `research/<ep>.reviewed.json`)

Each reviewed fact is the candidate plus the reviewer's verdict, scores, and —
only when `include` — a drafted `card`.

```json
{
  "episode": { "season": 1, "number": 8, "title": "The Diamond Dogs" },
  "reviewed_by": "grounding-reviewer",
  "threshold": 60,
  "facts": [
    {
      "id": "s1e8-darts-curiosity",
      "type": "philosophy",
      "verdict": "confirmed | partially-confirmed | contested | unverified | false",
      "verification_notes": "What you checked and found, 1–2 sentences.",
      "verified_sources": [ "https://… (only URLs you actually opened)" ],
      "scores": { "grounding": 5, "insight": 5, "surprise": 5, "relevance": 4, "spoiler_safety": 5 },
      "interest_score": 96,
      "tier": "gold | silver | bronze",
      "include": true,
      "card": { /* app-facing card, see below — present only when include == true */ }
    }
  ]
}
```

### Scoring rubric (each sub-score 1–5; be a tough grader, 5s are rare)

- **grounding** — how sure you are it's true after independent checking.
  5 = multiple independent reputable sources; 3 = partially corroborated;
  1 = unverified/contradicted. **Single-source support caps grounding at 2.**
- **insight** — how much the fact deepens understanding of the scene/character.
- **surprise** — how much a thoughtful rewatcher would say "I never caught that."
- **relevance** — how tightly it belongs to *this* episode.
- **spoiler_safety** — how well it fits without requiring later-episode knowledge
  (5 = `spoiler_scope: self`; lower as scope widens).

### interest_score (compute exactly; do the arithmetic)

```
interest_score = 7*insight + 7*surprise + 4*relevance + 2*spoiler_safety
```

Range 20–100 (grounding is deliberately excluded — it gates, it doesn't rank).

### tier

`gold` if `interest_score >= 80`, `silver` if `60–79`, else `bronze`.

### include gate

`include == true` only if **all** hold:
1. `verdict` is `confirmed` or `partially-confirmed`,
2. `scores.grounding >= 3`,
3. `interest_score >= threshold` (default **60**).

`false` and `unverified` are **never** included. `contested` is held
(`include: false`) and flagged for a human.

---

## Card schema (what ships into `episodes.json`)

The reviewer drafts this for every included fact. These are exactly the fields
`index.html` renders and curates on, so fill them precisely.

```json
{
  "id": "s1e8-darts-curiosity",
  "tag": "Curiosity over judgment",
  "title": "The darts scene",
  "moment": "Paraphrase. Zero reproduced dialogue; any source quote < 15 words.",
  "idea": "The real philosophy, plainly.",
  "why": "Why it matters / what to watch for.",
  "source": "Citation (may include <em>/<strong>).",
  "category": "Belief & hope | Ethics & character | Relationships | Redemption | Meta & trivia | Aesthetics",
  "interest": 5,
  "grounding": 5,
  "groundingStatus": "verified | attributed | partial | unverified | disputed",
  "groundingNotes": "Short note (mirror verification_notes).",
  "sourcesChecked": [ "https://…" ],
  "order": 1
}
```

`order` is **optional** and set by the human curator, not the reviewer: an
integer giving the card's position within its episode (ascending) so the page
reads in a sensible narrative order. Omit it and the card sorts by `interest`.

### Mapping reviewed fact → card

- `card.grounding` = `scores.grounding` (1–5).
- `card.interest` = `round(interest_score / 20)`, clamped to 1–5.
- `card.groundingStatus` from `verdict`: `confirmed`→`verified`,
  `partially-confirmed`→`partial`, `contested`→`disputed`. Use `attributed`
  when the claim is true *as an attribution/misattribution* (e.g. the Whitman
  line — "attributed to, not by").
- `card.groundingNotes` = `verification_notes`; `card.sourcesChecked` =
  `verified_sources`.
- `card.category` = the best fit from the controlled vocabulary above.

### The display contract (why scores ship on the card)

`index.html` reads these at render time:

- **Cards with `grounding` < 3 are withheld from the reader.**
- Displayed cards are **sorted by `interest`, highest first** — unless the
  curator gives the episode an explicit `order` (then they read in that order).

So withhold rather than inflate. A fascinating but unverifiable fact is
excluded, not ranked highly.

---

## Hard rules (both skills)

- **Paraphrase the show. Never reproduce dialogue.** Any source quote < 15 words.
- **Never invent a fact, source, attribution, verdict, or score.** A missing
  fact is fine; a fabricated one poisons the gift.
- Treat every "X said Y" as suspect until verified — the show itself
  misattributes ("be curious, not judgmental" → Whitman has no located source).
