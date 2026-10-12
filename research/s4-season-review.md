# Season 4 season review (2026-10-12)

A whole-season consistency pass after the finale aired on 2026-10-07. Season 4 was
written one episode a morning, so no single pass had ever read the ten episodes
against each other or re-checked early cards against what later aired and was said.

This file is the audit trail. Each changed card also carries a
`Season review 2026-10-12:` line in its `groundingNotes`.

## Method

1. Read all 111 cards end to end, looking for contradictions, repetition and
   gaps between cards.
2. Five researchers each took two episodes. Each one:
   - rebuilt the on-screen beat order from Wikipedia plus detailed recaps;
   - re-checked flagged claims against two or more sources;
   - did a commentary pass, prioritising 2026-09-12 to 2026-10-12.

   A sixth researcher covered season-wide reception and creator interviews.
3. Dialogue-dependent claims were spot-checked against the fan transcripts at
   `transcripts.foreverdreaming.org` (forum f=1095). Those pages load only in
   headless Chrome. The transcripts were used for scene order and to confirm what is
   said; no card quotes them.
4. **Limits.** Reddit (r/TedLasso) was unreachable from every route: WebFetch
   refuses it, curl gets a 403, and WebSearch rejects the domain. Fan sentiment
   comes instead from:
   - audience scores;
   - posts on X;
   - press write-ups of fan reaction.

   Deadline, THR, Tunefind and Gold Derby were blocked or paywalled. Claims that
   rest on them were read through syndicated copies or treated as search snippets.

## What the commentary says

- **Reception.**
  - Critics: Rotten Tomatoes 90% from 158 reviews; Metacritic 62.
  - Audiences: Rotten Tomatoes 66%; Metacritic users 4.2/10.
  - Critics read the season as "comfortably positive but lesser". Audiences are
    much cooler.
  - The finale split critics: the A.V. Club gave it a C−, Vulture 4/5, But Why Tho 9/10.
- **Best and worst episodes.**
  - Fans' favourite is E9 ("best episode of Ted Lasso so far" on X).
  - Critics' favourite is E8 (A.V. Club B+); The Athletic singled out the quiet
    Alice scene.
  - E1 is the most criticised (IndieWire, Ready Steady Cut).
- **Praise.** Tanya Reynolds's Alice is the consensus breakout and the strongest arc.
- **Complaints.**
  - The women's team is under-served.
  - Key moments happen off screen: Mae's death, Ted telling Henry, the final score.
  - Mae's death is used as a device for the share plot.
  - Zelda is one-note.
  - Roy and Keeley feel rushed.
- **Motifs the creators confirmed.**
  - The "assistant manager" name-tag bookend was Sudeikis's idea from day one
    (Hunt to TheWrap and Variety).
  - The sinking chair is "Chekhov's chair" (Hunt).
  - The writers' question for Mae was "how can Mae save the team from the grave?"
    (Hunt, Variety).
  - Hunt says the BELIEVE sign was amended rather than reprinted on purpose
    (TheWrap only, so single-source).
- **Season 5.** Not renewed as of 2026-10-12.

## Structural fixes

- **Card order.**
  - E1, E4, E6, E7, E8 and E10 were re-sequenced against the rebuilt beat lists.
  - E1 was the worst: the house sale and the tea farewell sat before the
    mid-episode museum visit.
  - E2, E3, E5 and E9 were already correct. Some moments in those episodes were
    reworded so they open on the beat they are ordered at.
- **Spines** (the four cards above "Show more notes"), re-curated so each episode
  opens on its strongest and most-discussed beats:
  - E1: the museum, the plaques and the tea.
  - E2: Josie's ACL, which opens the season's ACL thread.
  - E6: Michelle's two Twains.
  - E7: "Some pig".
  - E8: Roy's speech.
  - E10: Mae's will, Ted stepping down, the title line and the poem. Ted's lie to
    Henry folds, since two folded cards already carry that beat (title line restored
    above the fold on request, 2026-10-12).
- **Rendering bug.** Five tags stored HTML entities (`&rsquo;`, `&mdash;`). Tags are
  escaped on render, so the codes showed literally on screen. Fixed, and
  `verify.mjs` now fails if it happens again.
- **Interest rescored** across 33 cards. Season 4 now runs 25 fives, 64 fours and
  22 threes, where it was nearly all fours:
  - 5 = a note she would retell;
  - 3 = optional, overlapping or hedged.

## Contradictions between cards, fixed

| Was | Now |
|---|---|
| E8 called "follow the money" the season's *second* misattribution | Counts the actual run: the Whitman sign, the line the world credits to Nin, Voltron, Twain |
| E9 said Rebecca holds 51% and a buyer caps at 49%; E10 has her at 49% before Mae's 2% | E9 drops the arithmetic. E10 notes that Deadline's recapper flagged that the sums don't square with Season 3 |
| E2 gave an ACL risk of 2–6×; E8 gave 2–8× | E8 cites E2's figure and adds what it left out |
| E5 and E9 both told the 1921 FA ban in full, and E9 had a second Dick, Kerr Ladies card | E5 tells it; E9 builds on it. The duplicate E9 card `s4e9-dick-kerr-goodison` was removed |
| E4 and E6 both retold Roy's Season 1 knee injury nearly word for word | E6 points back to E4 |
| E2 left Alice's former club unnamed; E8 said Arsenal academy | Unnamed in both; Arsenal is Looper-only |
| E3 met Shannon in a street; E9 in a park | Park (2020 recaps; TVInsider) |

## Factual errors corrected (contradicted by sources)

- **E1**
  - The house sale comes *before* the friends fly home.
  - Ted texts Michelle rather than calling her.
  - The memorabilia office is near the end of the episode, not "before Rebecca
    knocks".
  - The last shot is the tea spit.
  - Higgins visits the museum because the Jazz Museum was closed.
- **E2.** Roy *fires* Beard on a technicality after Keeley urges it; he does not
  release him "wordlessly".
- **E3.**
  - Rebecca saves the sponsor rather than losing it.
  - Gemma quit because Alice was too hard on her.
  - "School uniform", "midfielder" and the siblings' pitch were unsupported.
- **E4.**
  - The Simpsons is the longest-running *scripted* primetime series.
  - Percy Jackson now has two sources.
  - "U.N.I.T.Y." is confirmed over the credits. E3's Queen Latifah track is
    "Ladies First".
- **E5.**
  - Nobody on screen names Anaïs Nin; Ted fumbles the bud line and Alice finishes it.
  - The "record" was the crowd, not a broadcast audience.
  - The people who tell Beard about Jane's show are the pub regulars, not strangers.
- **E6.**
  - Jamie *does* mind the bottle art.
  - "Adrift" is Michelle's word.
  - "See you at work", not "at practice".
  - The *A Spy in the House of Love* card is withheld (grounding 2, single source).
- **E7.**
  - Erin breaks up late in the episode.
  - There is no separate pay scene.
  - Zelda poses as a Chicago Fire recruiter rather than inventing an agent.
  - The SuperBob pairing is a set-up date.
- **E8.**
  - The doctor quits over workload, not pay.
  - Ted does name the ACL.
  - Messi is the first of several examples.
  - Mae says "follow the anger" outside the pub.
  - Ted's touchline panic attack is S2E6 "The Signal", written by Goldstein.
- **E9.**
  - Gemma's age is never stated, so "nineteen" is removed.
  - Mae also says she was not very good.
  - Rebecca and Higgins still suspect Rupert.
- **E10.**
  - Henry's age is not given on screen.
  - The season, not the hour, opens on the name tag.
  - Hunt spoke of an "outside hope" for Anthony Head, not planned material.
  - Anthony Head was born in 1954, not 1953.
  - No dropped Chelsea-match idea is on record.
  - Mae had been refusing to sell her shares.

## New material from the commentary pass

- **New card `s4e7-some-pig`.** Archie reads the BELIEVE sign as "Some pig"
  (*Charlotte's Web*). The episode's most-discussed moment had no card. Sources: the
  transcript, But Why Tho, The Cinemaholic and Fangirlish.
- **`s4e6-michelle-mark-twain` rewritten.** Michelle quotes Twain twice. "When in
  doubt, tell the truth" is real Twain, from *Following the Equator*. "Continuous
  improvement is better than delayed perfection" has no known source in Twain.
- **Added to existing cards:**
  - the E1 plaques and their E10 payoff, per Hunt;
  - the "Let it steep" tea;
  - the Public Enemy song title;
  - Susan Boyle's reply;
  - Michelle as the origin of the BELIEVE signs (Fort Scott);
  - "Jump Around" as Mae dances;
  - Pinter & Sons as Mae's executor;
  - "Chekhov's chair";
  - the name-tag bookend;
  - the Ted Lasso half-time appearance at the 2026 World Cup final;
  - the Ray Wilkins banner on the Shed Wall card.

## Considered and not done

- **"Mae Rides the Bus" title card.** No writer or cast explanation exists, only
  critics' readings.
- **People's "photo of Mae in Ted's Kansas office".** Its caption credits the
  wrong actor, and it is single-source.
- **Beard's *Whatever Happened to the Baby, Jane?* poster (E4) as a new card.** It is
  well sourced, but no source states the film riff and E4 already runs ten cards.
  The poster is mentioned on the E5 card instead.
