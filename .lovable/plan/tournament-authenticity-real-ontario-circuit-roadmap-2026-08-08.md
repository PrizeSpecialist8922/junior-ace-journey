# Tournament Authenticity & Real Ontario Circuit Roadmap

Goal: transform the tournament layer from a generic weekly list into a hardcore, location-aware competition calendar that mirrors the actual Ontario Tennis Association pathway and the logistics of the ITF/pro circuits.

## Phase 1 — Real Ontario Venues & Calendar View

Replace invented junior event names with an authentic seasonal calendar and venue metadata.

- Add a `VENUES` catalog: real Ontario/Tennis Canada sites (e.g., Aviva Centre / Sobeys Stadium, Ontario Racquet Club, Toronto Cricket Skating & Curling Club, Cedar Springs Health Racquet & Sports Club, National Tennis Centre / IGA Stadium in Montreal for cross-border ITF events).
- Tag each venue with `surface`, `indoor`, `city`, `travelCostTier`.
- Rewrite `listTournaments` so junior OTA/Selection/Provincial/Nationals events resolve to specific venues and surfaces based on the week of year.
- Add a new **Calendar** tab or panel showing the full 52-week schedule: which event is where, surface, entry deadline, and whether the player is committed.
- Keep existing eligibility gates but surface them in the calendar (locked events show the requirement).

## Phase 2 — Tournament Draw Bracket Visualization

Move from a match-by-match table to an actual bracket the player can read and feel.

- Generate a full knockout bracket for each entered event, including seeded positions derived from Ontario/ATP rank.
- Render the bracket in the Tournaments tab as a collapsible tree (rounds left-to-right or top-to-bottom).
- Show the player’s path: opponent names, UTRs, and scores per round.
- For round-robin events (Level 1 / college dual), keep the group table view.
- Persist the bracket in `TournamentRun` so historical runs can be reopened.

## Phase 3 — Entry System, Travel & Logistics

Add the real friction of committing to events weeks in advance.

- **Entry deadline:** each event has a commit-by week (e.g., 2-4 weeks before the event). The player must enter before the deadline; missed events disappear from the calendar.
- **Travel cost & fatigue:** events outside the GTA/Montreal deduct a travel fee from the bank and add a fatigue/jet-lag penalty for the event week. International ITF events cost more and hit harder.
- **Withdrawal:** allow pulling out before the deadline for a partial refund; late withdrawals cost money and ranking goodwill.
- **One event per week:** enforce that the player cannot enter two tournaments in the same week (already partly true via `playedThisWeek`, but make it explicit at entry time).

## Phase 4 — Surface Form, Weather & Conditions

Make surface and daily conditions matter in match outcomes.

- Track a `surfaceForm` record (Hard, Clay, Grass, Indoor Hard) that improves with matches played on that surface.
- Apply surface-form bonus/penalty in `simulateMatch` alongside the existing playstyle edge.
- Add a **conditions** roll for outdoor events: temperature, wind, humidity. Conditions interact with playstyle (e.g., wind hurts Serve & Volley, heat hurts low fitness).
- Display conditions on the draw/results panel and in the live career feed.

## Phase 5 — ATP Entry Cutoffs & Qualifying Rounds

Extend authenticity into the pro phase.

- For pro events, compute an entry cutoff rank each week. The player can only enter if their live ATP rank is inside the cutoff (or receives a wildcard).
- Add a **qualifying draw** option for events just above the player’s rank: play 2-3 qualifying matches for a main-draw spot.
- Wildcards: occasionally award a wildcard to a lower-ranked player for a home ATP Challenger or Masters 1000 event.
- Show the projected ATP ranking if the player wins the event.

## Out of scope (for now)

- Live weather API integration.
- Real-time official OTA rankings sync.
- Multiplayer or cloud saves.

## Success criteria

- A player aged 10-18 sees recognizable Ontario tournament names and venues.
- Entering an event requires planning around entry deadlines and travel costs.
- The draw bracket makes each tournament feel like a real competition path.
- Surface and conditions visibly affect match odds and outcomes.
- Pro events respect ATP-style entry cutoffs and offer qualifying draws.
