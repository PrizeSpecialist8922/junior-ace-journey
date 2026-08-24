# Next Realism Layer: Body, Mind, Media & Season Planning

Reviewed the current build: surfaces, venues, conditions, brackets, rivals, national team, college seasons, sponsors, equipment and year review are all in. The biggest missing realism systems are the player's body, their head, the outside world, and long-term planning.

## Phase 1 — Injuries, Load & Recovery

- Track a per-body-part load model (shoulder, wrist, back, knee) that rises with matches, hard-court weeks and high string tension, and falls with rest weeks and a Physio staff hire.
- Injury roll each week scaled by fatigue, age, load and fitness. Outcomes: niggle (play at reduced level), strain (1-4 weeks out), major (8-26 weeks out plus UTR/ranking decay while inactive).
- Injured weeks block tournament entry, force rehab training allocation, and log a recovery timeline in the feed.
- Add a Physio to the staff market and a "Manage Load" panel in Training showing each body part and injury risk.

## Phase 2 — Mental State, Burnout & Confidence

- Add `confidence` (short-term, moves with wins/losses and close-match outcomes) and `motivation` (long-term, drained by heavy schedules, bad results, no rest weeks).
- Confidence feeds directly into match simulation on tiebreaks and deciding sets; low motivation slows all training gains and can trigger a "considering quitting" event in the juniors.
- Rest/vacation weeks and the Psychologist restore motivation. Junior burnout is a real career risk at 5/5 difficulty.

## Phase 3 — Media, Reputation & Narrative Events

- Post-match press: interview choices (humble / cocky / blame conditions) that shift `sponsorReputation`, rival animosity and confidence.
- Weekly news headlines generated from the actual sim (upsets, streaks, rival head-to-heads, national team snubs).
- Random life events tied to age and phase: school exams, family finances, coach falling out, academy invite, agent offers.

## Phase 4 — Season Planner & Goals

- A Season Planner view: 52-week grid where the player pencils in target events, training blocks and rest weeks for the year ahead.
- Season goals set at the start of each year (ranking target, title target, selection points) with sponsor/coach reactions when hit or missed.
- Peaking mechanic: a planned training block before a target event gives a form bonus; a chaotic schedule gives fatigue and injury risk.

## Phase 5 — Deeper Opponent World

- Persistent AI career arcs: pool players progress, get injured, go to college, turn pro, retire — so the names at the top of the Ontario and ATP lists evolve believably over a decade.
- Named junior cohort that grows up alongside the player, feeding the existing rivals system instead of random names.
- Head-to-head pages per rival with surface splits and career timeline.

## Technical notes

- New `GameState` fields: `bodyLoad`, `injury`, `confidence`, `motivation`, `plan` (week -> intent), `goals`, `headlines`; all added defensively in `store.ts` `migrate` so existing saves keep working.
- Injury/mental modifiers plug into the existing `simulateMatch` edge stack next to `surfaceForm` and `conditionsEdge`.
- AI career arcs advance inside `nextWeek`'s existing weekly pool decay pass.
- New UI: "Load & Health" panel in Training, a `SeasonPlanner` tab, a press-conference modal after tournament runs, headlines strip on the Dashboard.

## Order of work

Phase 1 and 2 land together (they share the weekly roll), then Phase 4 planner, then Phase 3 media, then Phase 5.
