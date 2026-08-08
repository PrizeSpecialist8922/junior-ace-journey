# Ace Manager

Build a complete, fully playable, highly detailed Single Page Web Application (SPA) for a Text-Based Tennis Career Management Simulator. The UI must be an ultra-clean, modern, dark-mode dashboard (#121214 background, crisp white text, vibrant emerald green highlights for a premium sports app aesthetic). 

The game follows a single player's life from Age 4 through the exact real-world Ontario Tennis Association (OTA) competitive structure, the international ITF Junior circuit, NCAA college, and professional circuits.

Implement the following core game mechanics, data engines, and screen tabs completely:

1. THE AUTHENTIC 5-TIER ONTARIO TENNIS ASSOCIATION (OTA) JUNIOR SYSTEM

- Character Creation (Age 4): Prompt the user to choose their Name, Handedness (Left/Right), Playstyle (Serve & Volley, Baseline Grinder, All-Court, Counterpuncher). The country is locked to Canada, and the province is locked to Ontario.

- Early Childhood (Ages 4-9): Automated text logs detailing community club lessons, progressive tennis training (Red, Orange, and Green dot balls), and local non-sanctioned team events.

- Gated Tour Progression (Ages 10-18): The tournament selection calendar is strictly locked behind these 5 true-to-life OTA competitive tiers. To move to a higher level, the player must achieve specific Rogers Ranking Point metrics or UTR benchmarks:

  - LEVEL 1: Rogers First Set Tour - Rookie Tour

    - Gating: Entry-level. No restriction. 

    - Mechanics: Round-robin non-elimination events guaranteeing 3 matches. No ranking points are accrued. Used strictly to build early UTR and basic attributes.

  

  - LEVEL 2: Nike Transition Tour

    - Gating: Restricted to players ranked 31st or lower in Ontario in their registered age group. 

    - Mechanics: Earn initial low-tier National Bank/Rogers Ranking points.

  

  - LEVEL 3: Provincial Circuit

    - Gating: Requires a minimum provincial ranking (Top 100) or a UTR above 3.50. 

    - Mechanics: High-intensity singles tournaments oriented toward experienced competitive juniors.

  

  - LEVEL 3.5: Provincial Circuit Plus (+)

    - Gating: Requires Top 50 provincial ranking or UTR above 6.00.

    - Mechanics: High-performance singles tournaments. DOUBLES IS OFFICIALLY UNLOCKED HERE. The player must scout and pair up with an AI partner from the province to enter the tournament's doubles bracket.

  

  - LEVEL 4.0: Selection Series

    - Gating: Elite tier. Only the top-ranked juniors in Ontario can enter. 

    - Mechanics: Exactly 4 Selection Series events are held per calendar year: 2 Indoors (Winter) and 2 Outdoors (Summer). These are the absolute highest sources of domestic Rogers Ranking points.

2. THE SELECTION POINTS RACE TO NATIONAL BANK JUNIOR NATIONALS

- The Qualification Race: Create a tracking system for the U12, U14, U16, and U18 age brackets. The player earns cumulative points across the 4 Selection Series events and the Ontario Provincial Championships.

- National Gating: At the end of the selection cycle, the Top 16 players in Ontario in total points qualify for the Tennis Canada National Bank Junior Nationals.

- The Main Draw Guarantee: If the player finishes in the Top 16 of the provincial ranking loop, they are bypass the qualifying brackets and automatically make the Main Draw of Junior Nationals.

- STRICT ITF AGE RESTRICTION: The international ITF Junior Circuit is completely locked until the player turns exactly 13 years old. From age 13-18, the player balances local Selection Series grids against international ITF Junior tournaments (J30 up to J500 tiers).

3. THE DUAL-RATING ENGINE: ROGERS RANKING POINTS & GLOBAL UTR

- Rogers Ranking Points: Tracks domestic Ontario/Canada standings. Points expire on a rolling 52-week calendar. Your rank determines tournament acceptance seeding for all Canadian events.

- Global UTR Engine: Implement a dynamic Universal Tennis Rating (UTR) on a 1.00 to 16.50 scale. UTR tracks point-by-point performance and game-win ratios against opponents, entirely independent of your Rogers Ranking.

4. THE CHILDHOOD ECONOMY & STAFF ECOSYSTEM (Ages 4+)

- Parent Income System: At character creation, randomly generate a "Family Financial Status" (Working Class, Middle Class, Affluent) which sets a weekly allowance from ages 4-18. 

- Hiring Backroom Staff: Use your family allowance (and later, tournament prize money) to hire Private Coaches, Fitness Trainers, and Psychologists at any age to boost attribute multipliers based on what your family can afford.

5. THE THREE-TIER COLLEGE FORK (Ages 18-22)

- Age 18 Crossroads: The player can choose to Go Pro Immediately or accept a college tennis scholarship. Scholarships are strictly gated by your current UTR:

  - NCAA Division 3 (D3): Requires a UTR of 5.00 - 8.50. 

  - NCAA Division 2 (D2): Requires a UTR of 8.51 - 11.50.

  - NCAA Division 1 (D1): Requires a UTR of 11.51+. If GPA drops below 2.0, you are suspended from the team. 

6. ACCURATE PROFESSIONAL ATP TOUR ECONOMY ENGINE

- The Full Pro Progression Ladder: When entering the pro circuit, the player must climb the real-world tiered tour structure. Entry is strictly gated by their dynamic ATP Rank: ITF Futures -> ATP Challengers -> ATP 250 -> ATP 500 -> ATP Masters 1000 -> Grand Slams.

- Dynamic ATP Ranking Points Engine: Points expire exactly 52 weeks after they are earned. Implement a backend rolling calendar that tracks point decay against a pool of 500 simulated AI pro players.

7. REQUIRED UI TABS & WORKFLOW

- [Dashboard]: Shows current Age, Week, Season, active Tier (Level 1-4 OTA / College / Pro), current UTR, Rogers Ranking Points, ATP Rankings & Points, Bank Balance, GPA, Fatigue bar, and a running live text feed of recent events.

- [Training & Staff]: Manage hired staff based on your weekly budget. Sliders to spend your 10 weekly points across Tennis skills, Fitness, or Studying. Contains a "Next Week" simulation button.

- [Tournaments]: A structured list of available tournaments based on your level eligibility. Displays entry requirements (e.g., "Selection Series - Requires Top 32 Rogers Points"). Shows the bracket/draw when entered.

- [Doubles Roster]: View your current partner's stats, UTR, chemistry level, and manage invitations to new partners (unlocked at Level 3.5).

- [Trophy Room]: Display earned titles (including provincial OTA cups and National Bank Junior National hardware), Junior Record Archive, national team medals, career prize money earnings logs, and historical milestone tracking.

Ensure all Javascript logic for UTR/ATP calculations, rolling 52-week points decay, parent wealth gating, age restrictions, regional tour gating, and match simulations works perfectly without broken placeholder functions. Build a fully operational UI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d2091957-9aa4-4a6d-b878-07bac51c46b0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
