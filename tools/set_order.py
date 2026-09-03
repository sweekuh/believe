#!/usr/bin/env python3
"""Apply chronological `order` / explicit `tier` to cards in episodes.json.

Editing a 5,000-line JSON by hand to place a dozen integers is where mistakes
live. Import this and pass an {card_id: value} map instead; unknown ids are a
hard error, so a typo fails loudly rather than silently doing nothing.

    import sys; sys.path.insert(0, 'tools')
    from set_order import apply, apply_tier
    apply({"s3e1-henry-goodbye": 1, "s3e1-doubt-and-action": 2})
    apply_tier({"s3e5-belief-is-not-a-sign": "spine"})

`order` is where the moment falls in the episode (ascending). Leave trivia
unordered. See docs/facts-schema.md for how to derive it.
"""
import json
import sys


def _load(path):
    return json.load(open(path, encoding='utf-8'))


def _save(d, path):
    json.dump(d, open(path, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
    open(path, 'a', encoding='utf-8').write('\n')


def _walk(d):
    for season in d['seasons']:
        for ep in season['episodes']:
            for card in ep['cards']:
                yield card


def apply(mapping, path='episodes.json'):
    """Set `order` on each card named in {card_id: int}."""
    d = _load(path)
    seen = {c['id'] for c in _walk(d) if c['id'] in mapping}
    for card in _walk(d):
        if card['id'] in mapping:
            card['order'] = mapping[card['id']]
    missing = set(mapping) - seen
    if missing:
        sys.exit("unknown card ids: %s" % sorted(missing))
    _save(d, path)
    print("set order on %d cards" % len(seen))


def apply_tier(mapping, path='episodes.json'):
    """Set `tier` on each card named in {card_id: "spine"|"more"|None}."""
    d = _load(path)
    seen = {c['id'] for c in _walk(d) if c['id'] in mapping}
    for card in _walk(d):
        if card['id'] in mapping:
            value = mapping[card['id']]
            if value is None:
                card.pop('tier', None)
            else:
                card['tier'] = value
    missing = set(mapping) - seen
    if missing:
        sys.exit("unknown card ids: %s" % sorted(missing))
    _save(d, path)
    print("set tier on %d cards" % len(seen))
