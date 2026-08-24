# One Big Realism Phase: Living Opponent World, Injuries, and the College Safety Net

Everything below ships in a single pass.

## 1 — Deeper, Living Opponent Pool

- Give every pool player a real profile: age, playstyle, hand, home region, potential ceiling, development curve, and a career phase (junior / college / pro / retired).
- Advance the pool weekly: players improve or plateau by age and potential, pick up their own injuries, go to college, turn pro, fade, and retire. Retirees are replaced by new 10-year-olds so the top of the Ontario and ATP lists changes believably across a decade.
- A named junior cohort grows up alongside the player and feeds the existing rivals system instead of random one-off names.
- Rival detail view: head-to-head record, surface splits, their current rank/UTR trajectory, and a career timeline.
- Draws pull from this pool by rank/UTR band, so opponents in a Provincial draw are the same people you see on the rankings page.

## 2 — Injuries, Load & Recovery

- Body-load model per area (shoulder, wrist, back, knee). Load rises with matches, back-to-back weeks, hard courts, and high string tension; falls with rest, low-intensity training, and a Physio on staff.
- Weekly injury roll scaled by load, fatigue, age, and fitness. Outcomes:
  - Niggle — play through at reduced level.
  - Strain — 1-4 weeks out.
  - Major — 8-26 weeks out, with ranking points expiring untouched and UTR decay while inactive.
- Injured weeks block tournament entry, force rehab allocation in Training, and show a recovery timeline in the feed.
- Add Physio to the staff market. New "Load & Health" panel: per-area load bars, current injury, risk readout, and a rest action.
- Comeback effect: after a long layoff, match sharpness starts low and rebuilds over the first few events.

## 3 — College Fallback From the Pro Tour

- NCAA eligibility clock modeled properly: five-year window, four seasons of competition, and eligibility burned by prize money earned as a pro.
- A pro player who is struggling (rank stalled, bank low, still inside the eligibility window and age cap) gets a "College Fallback" offer: divisions available are recomputed from current UTR.
- Taking it moves phase back to `college`, resets the weekly economy to a scholarship, and preserves career stats and trophies.
- Leaving college again for the tour stays possible, so the fork can be crossed more than once while eligibility remains.

## 4 — What Else Goes In This Phase

- **Confidence & motivation:** confidence swings with wins, close losses, and upsets, and feeds tiebreak/deciding-set outcomes. Motivation drains from heavy schedules and bad runs, slows training gains, and can trigger a junior burnout crossroads. Rest weeks and the Psychologist restore it.
- **Press & reputation:** post-tournament interview choices (humble / cocky / blame conditions) that shift sponsor reputation, rival animosity, and confidence.
- **Headlines feed:** weekly generated news from the actual sim — upsets, streaks, rival results, injury news, retirements in the pool.
- **Season goals:** each year opens with ranking/title/selection targets; hitting or missing them affects sponsor reputation and coach relations.

## Technical notes

- New `GameState` fields: `bodyLoad`, `injury`, `sharpness`, `confidence`, `motivation`, `headlines`, `goals`, `eligibility`; pool players gain the richer profile shape. All added defensively in `store.ts` `migrate` so existing saves load.
- Injury, sharpness, and confidence modifiers slot into the existing `simulateMatch` edge stack alongside `surfaceForm` and `conditionsEdge`.
- Pool aging/retirement and the injury roll run inside `nextWeek`'s existing weekly pass.
- `listTournaments` and `playTournament` gain injury gating and pool-sourced opponents.
- New UI: "Load & Health" panel in Training, rival detail view, headlines strip and goals card on the Dashboard, press-conference prompt after a tournament run, College Fallback card when the offer is live.

## Out of scope

Multiplayer, cloud saves, live weather or real rankings sync.
