import type { Playstyle, StaffRole, Wealth } from "./types";

export const PLAYSTYLES: Playstyle[] = [
  "Serve & Volley",
  "Baseline Grinder",
  "All-Court",
  "Counterpuncher",
];

export const STYLE_BONUS: Record<Playstyle, string> = {
  "Serve & Volley": "Faster games on hard/indoor courts, thrives in short points",
  "Baseline Grinder": "Extra stamina edge in three-setters and clay events",
  "All-Court": "Balanced — no weaknesses, slightly slower peak growth",
  Counterpuncher: "Overperforms against higher-rated opponents",
};

export const WEALTH_ALLOWANCE: Record<Wealth, number> = {
  "Working Class": 140,
  "Middle Class": 340,
  Affluent: 950,
};

export const OTA_LEVELS = [
  {
    level: 1,
    name: "Rogers First Set Tour — Rookie Tour",
    gate: "Entry level — no restriction",
    note: "Round-robin, 3 guaranteed matches. No ranking points. Builds UTR + attributes.",
  },
  {
    level: 2,
    name: "Nike Transition Tour",
    gate: "Ranked 31st or lower in Ontario (age group)",
    note: "First National Bank / Rogers ranking points.",
  },
  {
    level: 3,
    name: "Provincial Circuit",
    gate: "Top 100 Ontario ranking or UTR above 3.50",
    note: "Competitive singles draws for experienced juniors.",
  },
  {
    level: 3.5,
    name: "Provincial Circuit Plus (+)",
    gate: "Top 50 Ontario ranking or UTR above 6.00",
    note: "High-performance singles. Doubles officially unlocked.",
  },
  {
    level: 4,
    name: "Selection Series",
    gate: "Top 32 Ontario ranking (elite tier)",
    note: "4 events per year — 2 indoor (winter), 2 outdoor (summer). Highest domestic points.",
  },
];

/** Selection Series calendar weeks: 2 indoor winter, 2 outdoor summer. */
export const SELECTION_WEEKS = [6, 12, 28, 34];
export const PROVINCIALS_WEEK = 42;
export const NATIONALS_WEEK = 48;

export const ITF_TIERS = [
  { name: "ITF J30", utr: 4.5, points: 30, drawSize: 32 },
  { name: "ITF J60", utr: 6.0, points: 60, drawSize: 32 },
  { name: "ITF J100", utr: 7.5, points: 100, drawSize: 48 },
  { name: "ITF J200", utr: 9.0, points: 200, drawSize: 48 },
  { name: "ITF J500", utr: 10.5, points: 500, drawSize: 64 },
];

export const PRO_TIERS = [
  { name: "ITF Futures (M15)", rank: 100000, utr: 10.5, points: 12, prize: 2200, drawSize: 32 },
  { name: "ITF Futures (M25)", rank: 900, utr: 11.5, points: 25, prize: 4300, drawSize: 32 },
  { name: "ATP Challenger 75", rank: 450, utr: 12.5, points: 75, prize: 11000, drawSize: 32 },
  { name: "ATP Challenger 125", rank: 250, utr: 13.2, points: 125, prize: 22000, drawSize: 48 },
  { name: "ATP 250", rank: 150, utr: 13.8, points: 250, prize: 95000, drawSize: 32 },
  { name: "ATP 500", rank: 80, utr: 14.4, points: 500, prize: 380000, drawSize: 32 },
  { name: "ATP Masters 1000", rank: 45, utr: 15.0, points: 1000, prize: 950000, drawSize: 64 },
  { name: "Grand Slam", rank: 104, utr: 15.4, points: 2000, prize: 2600000, drawSize: 128 },
];

export const SURFACES = ["Indoor Hard", "Hard", "Clay", "Grass"];

export const STAFF_CATALOG: {
  role: StaffRole;
  tiers: { name: string; quality: number; weekly: number }[];
}[] = [
  {
    role: "Private Coach",
    tiers: [
      { name: "Club Pro", quality: 1, weekly: 90 },
      { name: "Certified Coach 3", quality: 2, weekly: 220 },
      { name: "High Performance Coach", quality: 3, weekly: 520 },
      { name: "Former Tour Player", quality: 4, weekly: 1200 },
      { name: "Ex-Top 20 Mentor", quality: 5, weekly: 3000 },
    ],
  },
  {
    role: "Fitness Trainer",
    tiers: [
      { name: "Community Gym Trainer", quality: 1, weekly: 70 },
      { name: "Strength & Conditioning", quality: 2, weekly: 180 },
      { name: "Athletic Performance Lead", quality: 3, weekly: 430 },
      { name: "Olympic S&C Specialist", quality: 4, weekly: 1000 },
    ],
  },
  {
    role: "Psychologist",
    tiers: [
      { name: "School Counsellor", quality: 1, weekly: 60 },
      { name: "Sport Psychologist", quality: 2, weekly: 210 },
      { name: "Elite Mental Coach", quality: 3, weekly: 560 },
      { name: "Tour Mindset Guru", quality: 4, weekly: 1300 },
    ],
  },
];

const FIRST = [
  "Liam","Noah","Ethan","Lucas","Owen","Mateo","Felix","Jonas","Ryo","Arjun",
  "Nathan","Cole","Émile","Declan","Kai","Theo","Marco","Dylan","Alexei","Hugo",
];
const LAST = [
  "Tremblay","Nguyen","Kowalski","Bianchi","Okafor","Suzuki","Novak","Reyes",
  "Lindqvist","Bhatia","Moreau","Zhang","O'Brien","Petrov","Hausmann","Silva",
  "Dubois","Kaur","Fernandez","Vasilev",
];

export function randomName(rng: () => number = Math.random) {
  return `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)]}`;
}
