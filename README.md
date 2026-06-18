# Believe

A small gift: a Ted Lasso philosophy companion for Mom. As she rewatches
Season 1, she opens a bookmarked link on her phone, picks the episode she
just finished, taps "show me the notes," and reads a few short cards on the
deeper ideas hiding under the jokes — and can jot a line of her own that's
still there next time.

It's a **static web app**: plain HTML, CSS, and vanilla JS. No backend, no
build step, no framework, no accounts. All the content lives in one JSON file.

## Files

```
believe/
├── index.html               # the app: loads episodes.json, renders cards, gate, notes
├── episodes.json            # ALL content — edit this to add episodes/cards
├── design-reference/
│   └── believe-s1e1.html    # the approved single-file prototype (design source of truth)
└── README.md
```

## How it works

- **Episode picker** (a dropdown) switches between episodes. Switching always
  re-hides the cards behind the spoiler gate.
- **Spoiler gate**: nothing shows until she taps "I've watched it — show me
  the notes." Episodes that aren't written yet show a "coming soon" card with
  no gate.
- **Cards** are rendered from `episodes.json`: a tag, a title, the moment
  (paraphrased), the idea, a "why it matters" line, and a source.
- **Personal notes**: each real card has a pink note box. Notes save to the
  browser's `localStorage`, keyed `believe:note:{card.id}`. They save on
  **Save** and on blur, and reload with the card.
- **"Copy all my notes"** gathers every note across the season as plain text
  to the clipboard. This is the only backup — `localStorage` is per-browser,
  per-device, and is erased if she clears browsing data.

## Adding or editing content

Edit `episodes.json` — no code change needed.

```json
{
  "id": "s1e2-some-slug",
  "tag": "Belief",
  "title": "Card title (may contain <em>/<strong>)",
  "moment": "Paraphrase the moment. Never reproduce show dialogue.",
  "idea": "The real philosophy, plainly.",
  "why": "Why it matters / what to watch for.",
  "source": "Citation."
}
```

Rules:
- **Stable `id` per card** (format `s{season}e{episode}-{slug}`). Notes map to
  `id`, so reordering cards never scrambles Mom's notes. Don't reuse ids.
- **Paraphrase moments. Zero reproduced dialogue.** (IP line.)
- **Verify every philosophical attribution before it ships.** A wrong
  attribution in a gift is worse than a missing one. If a "deeper meaning" is
  a stretch, cut it rather than invent.
- A card's `title`, `moment`, `idea`, `why`, and `source` may contain simple
  inline HTML (`<em>`, `<strong>`). Empty fields are simply not rendered.
- Episodes 2–10 currently hold a single "coming soon" placeholder card.
  Replace the placeholder with real cards as they're written.

## Grounding scores & the display contract

Cards may carry verification/curation metadata, added by the **grounding
reviewer** (see below). The app reads these at render time:

| Field | Meaning |
|-------|---------|
| `grounding` (1–5) | How well the card's claims hold up to independent web checks. **Cards with `grounding` < 3 are withheld from the reader.** |
| `interest` (1–5) | Editorial "oh, I never caught that" value. **Displayed cards are sorted by `interest`, highest first.** |
| `category` | One of `Belief & hope`, `Ethics & character`, `Relationships`, `Redemption`, `Meta & trivia`, `Aesthetics`. |
| `groundingStatus` | `verified` \| `attributed` \| `partial` \| `unverified` \| `disputed`. |
| `groundingNotes` | What the reviewer found. |
| `sourcesChecked` | URLs used to verify. |

These fields are **optional and backward-compatible**: a card without them is
shown and sorts neutrally (so the original E1 cards and the placeholders are
unaffected). The thresholds live at the top of the script in `index.html`
(`GROUNDING_MIN`, `DEFAULT_INTEREST`). None of this metadata is shown to the
reader — it only decides *which* cards appear and *in what order*.

### The fact pipeline (Claude Code skills)

Two skills in `.claude/skills/` turn an episode into shippable cards, with an
independent verification step in the middle (contract: `docs/facts-schema.md`):

- **`episode-fact-hunter`** — breadth/discovery → `research/<ep>.candidates.json`.
- **`grounding-reviewer`** — independently re-verifies every claim from primary
  sources (via `WebSearch`/`WebFetch`), scores and ranks, gates inclusion, and
  drafts ready-to-paste cards → `research/<ep>.reviewed.json`. It withholds
  rather than inflates anything it can't corroborate.

Invoke from Claude Code:

> /episode-fact-hunter s1e2
> /grounding-reviewer s1e2

Then a human promotes the `include: true` cards into `episodes.json`.

## Running locally

Opening `index.html` by double-click uses `file://`, and the browser blocks
`fetch('./episodes.json')` there. Serve it over HTTP instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Hosting (GitHub Pages)

1. Push to a **public** repo named `believe`.
2. Repo → Settings → Pages → Build and deployment → Source: "Deploy from a
   branch" → Branch `main` → `/ (root)` → Save.
3. After ~1 minute it's live at `https://<your-username>.github.io/believe/`.
   HTTPS is automatic. Send Mom that link to bookmark.

## A note for Mom

Your notes live on this phone, in this browser. They won't follow you to
another device, and clearing your browsing data erases them. Tap **"Copy all
my notes"** now and then and paste them somewhere safe (a text or email to
yourself works) — that's your backup.
