import type { Playstyle, StaffRole, Surface, Venue, Wealth } from "./types";

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

/* --------------------------------- venues --------------------------------- */
/** travelCostTier: 1 = GTA, 2 = Ontario/Quebec, 3 = North America, 4 = intercontinental */

const V = (
  id: string,
  name: string,
  city: string,
  region: string,
  country: string,
  surface: Surface,
  indoor: boolean,
  travelCostTier: 1 | 2 | 3 | 4,
): Venue => ({ id, name, city, region, country, surface, indoor, travelCostTier });

export const VENUES: Venue[] = [
  // ---- Ontario / Canada
  V("sobeys-stadium", "Sobeys Stadium / Aviva Centre", "Toronto", "Ontario", "Canada", "Hard", false, 1),
  V("ontario-racquet-club", "Ontario Racquet Club", "Mississauga", "Ontario", "Canada", "Indoor Hard", true, 1),
  V("toronto-cricket", "Toronto Cricket, Skating & Curling Club", "Toronto", "Ontario", "Canada", "Indoor Hard", true, 1),
  V("cedar-springs", "Cedar Springs Racquet Club", "Burlington", "Ontario", "Canada", "Indoor Hard", true, 1),
  V("mayfair-lakeshore", "Mayfair Lakeshore", "Toronto", "Ontario", "Canada", "Indoor Hard", true, 1),
  V("ra-centre", "RA Centre", "Ottawa", "Ontario", "Canada", "Indoor Hard", true, 2),
  V("national-tennis-centre", "National Tennis Centre / IGA Stadium", "Montreal", "Quebec", "Canada", "Hard", false, 2),
  V("london-tennis-club", "London Tennis Club", "London", "Ontario", "Canada", "Clay", false, 2),
  V("niagara-tennis", "Niagara Tennis Academy", "Niagara", "Ontario", "Canada", "Hard", false, 1),
  V("barrie-tennis", "Barrie Community Tennis Club", "Barrie", "Ontario", "Canada", "Hard", false, 1),
  V("windsor-tennis", "Windsor Tennis Club", "Windsor", "Ontario", "Canada", "Hard", false, 2),
  V("kingston-tennis", "Kingston Tennis Club", "Kingston", "Ontario", "Canada", "Clay", false, 2),
  V("thornhill-club", "Thornhill Country Club", "Thornhill", "Ontario", "Canada", "Grass", false, 1),
  V("vancouver-hollyburn", "Hollyburn Country Club", "Vancouver", "British Columbia", "Canada", "Hard", false, 3),

  // ---- United States
  V("usta-orlando", "USTA National Campus", "Orlando", "Florida", "USA", "Hard", false, 3),
  V("ijtc-college-park", "Junior Tennis Champions Center", "College Park", "Maryland", "USA", "Hard", false, 3),
  V("kalamazoo", "Stowe Stadium", "Kalamazoo", "Michigan", "USA", "Hard", false, 3),
  V("indian-wells", "Indian Wells Tennis Garden", "Indian Wells", "California", "USA", "Hard", false, 3),
  V("miami-hard-rock", "Hard Rock Stadium", "Miami", "Florida", "USA", "Hard", false, 3),
  V("cincinnati-lindner", "Lindner Family Tennis Center", "Cincinnati", "Ohio", "USA", "Hard", false, 3),
  V("newport-casino", "International Tennis Hall of Fame", "Newport", "Rhode Island", "USA", "Grass", false, 3),
  V("houston-river-oaks", "River Oaks Country Club", "Houston", "Texas", "USA", "Clay", false, 3),
  V("usopen-flushing", "USTA Billie Jean King National Tennis Center", "New York", "New York", "USA", "Hard", false, 3),

  // ---- Europe
  V("rolandgarros", "Stade Roland-Garros", "Paris", "Île-de-France", "France", "Clay", false, 4),
  V("wimbledon", "All England Lawn Tennis Club", "London", "England", "Great Britain", "Grass", false, 4),
  V("foro-italico", "Foro Italico", "Rome", "Lazio", "Italy", "Clay", false, 4),
  V("caja-magica", "Caja Mágica", "Madrid", "Madrid", "Spain", "Clay", false, 4),
  V("monte-carlo", "Monte-Carlo Country Club", "Monte Carlo", "Monaco", "Monaco", "Clay", false, 4),
  V("halle-owl", "OWL Arena", "Halle", "NRW", "Germany", "Grass", false, 4),
  V("rotterdam-ahoy", "Rotterdam Ahoy", "Rotterdam", "South Holland", "Netherlands", "Indoor Hard", true, 4),
  V("bercy", "Accor Arena", "Paris", "Île-de-France", "France", "Indoor Hard", true, 4),
  V("basel-halle", "St. Jakobshalle", "Basel", "Basel", "Switzerland", "Indoor Hard", true, 4),
  V("prague-sparta", "Sparta Praha Tennis", "Prague", "Prague", "Czechia", "Clay", false, 4),
  V("barcelona-rctb", "Real Club de Tenis Barcelona", "Barcelona", "Catalonia", "Spain", "Clay", false, 4),
  V("vienna-wiener", "Wiener Stadthalle", "Vienna", "Vienna", "Austria", "Indoor Hard", true, 4),

  // ---- Rest of world
  V("melbourne-park", "Melbourne Park", "Melbourne", "Victoria", "Australia", "Hard", false, 4),
  V("ariake", "Ariake Coliseum", "Tokyo", "Kanto", "Japan", "Hard", false, 4),
  V("shanghai-qizhong", "Qizhong Forest Arena", "Shanghai", "Shanghai", "China", "Hard", false, 4),
  V("dubai-aviation", "Dubai Duty Free Stadium", "Dubai", "Dubai", "UAE", "Hard", false, 4),
  V("buenos-aires-lawn", "Buenos Aires Lawn Tennis Club", "Buenos Aires", "Buenos Aires", "Argentina", "Clay", false, 4),
  V("santiago-anfa", "Club Deportivo Anfa", "Santiago", "Santiago", "Chile", "Clay", false, 4),
  V("delhi-dlta", "DLTA Complex", "New Delhi", "Delhi", "India", "Hard", false, 4),
  V("cairo-heliopolis", "Heliopolis Sporting Club", "Cairo", "Cairo", "Egypt", "Clay", false, 4),
  V("tunis-tennis", "Tennis Club de Tunis", "Tunis", "Tunis", "Tunisia", "Clay", false, 4),
  V("monastir-flamingo", "Flamingo Tennis Club", "Monastir", "Monastir", "Tunisia", "Hard", false, 4),
];

export const DEFAULT_SURFACE: Surface = "Indoor Hard";

export function venueById(id: string): Venue {
  return VENUES.find((v) => v.id === id) ?? VENUES[0]!;
}

export function surfaceForWeek(week: number): Surface {
  if (week <= 14 || week >= 44) return "Indoor Hard";
  if (week <= 24) return "Clay";
  if (week <= 30) return "Grass";
  return "Hard";
}

export function venueForSurface(surface: Surface): Venue {
  const matches = VENUES.filter((v) => v.surface === surface && v.travelCostTier <= 2);
  if (matches.length) return matches[Math.floor(Math.random() * matches.length)]!;
  return VENUES[Math.floor(Math.random() * VENUES.length)]!;
}

/** Travel cost by tier, before staff/entourage multipliers. */
export const TRAVEL_COST: Record<1 | 2 | 3 | 4, number> = { 1: 0, 2: 220, 3: 1650, 4: 3900 };

/* ------------------------------ OTA structure ------------------------------ */

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
    gate: "Top 150 Ontario ranking or UTR above 3.50",
    note: "Competitive singles draws for experienced juniors.",
  },
  {
    level: 3.5,
    name: "Provincial Circuit Plus (+)",
    gate: "Top 50 Ontario ranking or UTR above 6.00",
    note: "Only 10 designated weeks per season. Doubles officially unlocked.",
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
/** Provincial Circuit + runs only 10 weeks of the 52-week season. */
export const PROVINCIAL_PLUS_WEEKS = [4, 9, 16, 20, 24, 26, 31, 38, 45, 50];
export const PROVINCIALS_WEEK = 42;
export const NATIONALS_WEEK = 48;

/* ------------------------- international junior play ----------------------- */

export interface IntlJuniorEvent {
  id: string;
  name: string;
  circuit: "Tennis Europe" | "USTA National" | "COTECC" | "Asian Junior";
  minAge: number;
  maxAge: number;
  venueId: string;
  utr: number;
  points: number;
  drawSize: number;
  weeks: number[];
}

export const INTL_JUNIOR_EVENTS: IntlJuniorEvent[] = [
  {
    id: "te-u12",
    name: "Tennis Europe U12 — Prague Junior Open",
    circuit: "Tennis Europe",
    minAge: 10,
    maxAge: 12,
    venueId: "prague-sparta",
    utr: 5.2,
    points: 120,
    drawSize: 32,
    weeks: [11, 19, 33],
  },
  {
    id: "te-u14",
    name: "Tennis Europe U14 — Barcelona Winter Cup",
    circuit: "Tennis Europe",
    minAge: 12,
    maxAge: 14,
    venueId: "barcelona-rctb",
    utr: 7.1,
    points: 180,
    drawSize: 32,
    weeks: [8, 17, 40],
  },
  {
    id: "te-u16",
    name: "Tennis Europe U16 — Halle Grass Trophy",
    circuit: "Tennis Europe",
    minAge: 14,
    maxAge: 16,
    venueId: "halle-owl",
    utr: 8.6,
    points: 240,
    drawSize: 32,
    weeks: [25, 29],
  },
  {
    id: "usta-l3",
    name: "USTA National Level 3 — Orlando",
    circuit: "USTA National",
    minAge: 10,
    maxAge: 18,
    venueId: "usta-orlando",
    utr: 6.4,
    points: 150,
    drawSize: 64,
    weeks: [5, 14, 27, 36, 46],
  },
  {
    id: "usta-l1",
    name: "USTA National Championships — Kalamazoo",
    circuit: "USTA National",
    minAge: 14,
    maxAge: 18,
    venueId: "kalamazoo",
    utr: 9.8,
    points: 320,
    drawSize: 64,
    weeks: [32],
  },
  {
    id: "cotecc",
    name: "COTECC Junior Championships — Santiago",
    circuit: "COTECC",
    minAge: 11,
    maxAge: 16,
    venueId: "santiago-anfa",
    utr: 6.9,
    points: 160,
    drawSize: 32,
    weeks: [7, 43],
  },
  {
    id: "asia-junior",
    name: "Asian Junior Championships — Tokyo",
    circuit: "Asian Junior",
    minAge: 12,
    maxAge: 18,
    venueId: "ariake",
    utr: 8.2,
    points: 200,
    drawSize: 32,
    weeks: [13, 21, 47],
  },
];

/* --------------------------- ITF junior circuit ---------------------------- */

export interface ItfTier {
  name: string;
  /** field strength */
  utr: number;
  /** minimum player UTR to be accepted */
  minUtr: number;
  /** ITF junior ranking needed for direct acceptance (999999 = unranked ok) */
  directRank: number;
  /** ITF junior ranking needed to enter qualifying */
  qualRank: number;
  points: number;
  drawSize: number;
  qualifyingRounds: number;
  venueIds: string[];
}

export const ITF_TIERS: ItfTier[] = [
  {
    name: "ITF J30",
    utr: 8.4,
    minUtr: 7.2,
    directRank: 999999,
    qualRank: 999999,
    points: 30,
    drawSize: 32,
    qualifyingRounds: 2,
    venueIds: ["monastir-flamingo", "cairo-heliopolis", "delhi-dlta", "tunis-tennis"],
  },
  {
    name: "ITF J60",
    utr: 9.6,
    minUtr: 8.6,
    directRank: 1200,
    qualRank: 2200,
    points: 60,
    drawSize: 32,
    qualifyingRounds: 2,
    venueIds: ["prague-sparta", "santiago-anfa", "ijtc-college-park", "delhi-dlta"],
  },
  {
    name: "ITF J100",
    utr: 10.7,
    minUtr: 9.7,
    directRank: 550,
    qualRank: 1100,
    points: 100,
    drawSize: 48,
    qualifyingRounds: 3,
    venueIds: ["barcelona-rctb", "halle-owl", "usta-orlando", "ariake"],
  },
  {
    name: "ITF J200",
    utr: 11.6,
    minUtr: 10.6,
    directRank: 260,
    qualRank: 520,
    points: 200,
    drawSize: 48,
    qualifyingRounds: 3,
    venueIds: ["monte-carlo", "foro-italico", "melbourne-park", "buenos-aires-lawn"],
  },
  {
    name: "ITF J300",
    utr: 12.2,
    minUtr: 11.2,
    directRank: 150,
    qualRank: 300,
    points: 300,
    drawSize: 64,
    qualifyingRounds: 3,
    venueIds: ["caja-magica", "shanghai-qizhong", "usta-orlando", "cairo-heliopolis"],
  },
  {
    name: "ITF J500",
    utr: 12.8,
    minUtr: 11.8,
    directRank: 80,
    qualRank: 160,
    points: 500,
    drawSize: 64,
    qualifyingRounds: 3,
    venueIds: ["ijtc-college-park", "prague-sparta", "melbourne-park", "rolandgarros"],
  },
  {
    name: "Junior Grand Slam",
    utr: 13.4,
    minUtr: 12.4,
    directRank: 30,
    qualRank: 70,
    points: 1000,
    drawSize: 64,
    qualifyingRounds: 3,
    venueIds: ["melbourne-park", "rolandgarros", "wimbledon", "usopen-flushing"],
  },
];

/* ------------------------------- pro circuit ------------------------------- */

export interface ProTier {
  id: string;
  name: string;
  short: string;
  /** ATP ranking for direct main-draw acceptance */
  directRank: number;
  /** ATP ranking needed to even enter qualifying (no rank = no entry) */
  qualRank: number;
  utr: number;
  points: number;
  prize: number;
  drawSize: number;
  qualifyingRounds: number;
  venueIds: string[];
  /** fixed calendar weeks, when the event is a real tour stop */
  weeks?: number[];
}

export const PRO_TIERS: ProTier[] = [
  {
    id: "m15",
    name: "ITF World Tennis Tour M15",
    short: "M15",
    directRank: 1300,
    qualRank: 2000,
    utr: 12.6,
    points: 8,
    prize: 2160,
    drawSize: 32,
    qualifyingRounds: 2,
    venueIds: ["monastir-flamingo", "cairo-heliopolis", "tunis-tennis", "delhi-dlta", "usta-orlando"],
  },
  {
    id: "m25",
    name: "ITF World Tennis Tour M25",
    short: "M25",
    directRank: 750,
    qualRank: 1400,
    utr: 13.2,
    points: 20,
    prize: 4320,
    drawSize: 32,
    qualifyingRounds: 2,
    venueIds: ["houston-river-oaks", "prague-sparta", "santiago-anfa", "ariake", "ijtc-college-park"],
  },
  {
    id: "ch50",
    name: "ATP Challenger 50",
    short: "CH50",
    directRank: 400,
    qualRank: 750,
    utr: 13.7,
    points: 50,
    prize: 7200,
    drawSize: 32,
    qualifyingRounds: 2,
    venueIds: ["vancouver-hollyburn", "buenos-aires-lawn", "prague-sparta", "delhi-dlta"],
  },
  {
    id: "ch100",
    name: "ATP Challenger 100",
    short: "CH100",
    directRank: 230,
    qualRank: 420,
    utr: 14.1,
    points: 100,
    prize: 21600,
    drawSize: 48,
    qualifyingRounds: 2,
    venueIds: ["ra-centre", "barcelona-rctb", "cincinnati-lindner", "shanghai-qizhong"],
  },
  {
    id: "ch175",
    name: "ATP Challenger 175",
    short: "CH175",
    directRank: 130,
    qualRank: 240,
    utr: 14.5,
    points: 175,
    prize: 38000,
    drawSize: 48,
    qualifyingRounds: 2,
    venueIds: ["dubai-aviation", "basel-halle", "usta-orlando", "melbourne-park"],
  },
  {
    id: "atp250",
    name: "ATP 250",
    short: "ATP 250",
    directRank: 100,
    qualRank: 200,
    utr: 14.9,
    points: 250,
    prize: 112000,
    drawSize: 32,
    qualifyingRounds: 2,
    venueIds: ["newport-casino", "houston-river-oaks", "rotterdam-ahoy", "vienna-wiener", "ariake"],
  },
  {
    id: "atp500",
    name: "ATP 500",
    short: "ATP 500",
    directRank: 60,
    qualRank: 130,
    utr: 15.3,
    points: 500,
    prize: 420000,
    drawSize: 32,
    qualifyingRounds: 2,
    venueIds: ["dubai-aviation", "barcelona-rctb", "halle-owl", "basel-halle", "tokyo-ariake"],
  },
  {
    id: "masters",
    name: "ATP Masters 1000",
    short: "M1000",
    directRank: 40,
    qualRank: 90,
    utr: 15.7,
    points: 1000,
    prize: 1100000,
    drawSize: 64,
    qualifyingRounds: 2,
    venueIds: [
      "indian-wells",
      "miami-hard-rock",
      "foro-italico",
      "caja-magica",
      "cincinnati-lindner",
      "shanghai-qizhong",
      "bercy",
      "sobeys-stadium",
    ],
  },
];

/** The four majors, at their real cities, surfaces and calendar weeks. */
export const GRAND_SLAMS = [
  {
    id: "ao",
    name: "Australian Open",
    venueId: "melbourne-park",
    week: 3,
    surface: "Hard" as Surface,
  },
  {
    id: "rg",
    name: "Roland-Garros",
    venueId: "rolandgarros",
    week: 22,
    surface: "Clay" as Surface,
  },
  {
    id: "wimb",
    name: "The Championships, Wimbledon",
    venueId: "wimbledon",
    week: 27,
    surface: "Grass" as Surface,
  },
  {
    id: "uso",
    name: "US Open",
    venueId: "usopen-flushing",
    week: 35,
    surface: "Hard" as Surface,
  },
];

export const SLAM_SPEC = {
  directRank: 104,
  qualRank: 250,
  utr: 16.0,
  points: 2000,
  prize: 3600000,
  drawSize: 128,
  qualifyingRounds: 3,
};

export const SPONSORS = [
  {
    id: "northstar",
    name: "NorthStar Athletics",
    weekly: 175,
    requirement: "UTR 8+",
    minReputation: 20,
  },
  {
    id: "baseline",
    name: "Baseline Labs",
    weekly: 450,
    requirement: "UTR 10+ or Ontario Top 10",
    minReputation: 35,
  },
  {
    id: "maple",
    name: "Maple Performance",
    weekly: 1100,
    requirement: "UTR 12+ or ATP Top 200",
    minReputation: 50,
  },
  {
    id: "summit",
    name: "Summit Global",
    weekly: 2800,
    requirement: "UTR 14+ or ATP Top 100",
    minReputation: 65,
  },
  {
    id: "apex",
    name: "Apex International",
    weekly: 6500,
    requirement: "ATP Top 50",
    minReputation: 80,
  },
];

export const RACQUETS = [
  { name: "AeroForge Power", bonus: "Power: +0.18 for Serve & Volley", styles: ["Serve & Volley"] },
  {
    name: "TrueLine Control",
    bonus: "Control: +0.18 for grinders and counterpunchers",
    styles: ["Baseline Grinder", "Counterpuncher"],
  },
  { name: "Vertex Tour", bonus: "Balance: +0.12 for All-Court", styles: ["All-Court"] },
  { name: "Northern Strike", bonus: "Fast-court power: +0.10 on hard courts", styles: [] },
  { name: "Heritage 98", bonus: "Precision: +0.08 on every surface", styles: [] },
];

export const NCAA_SCHOOLS = [
  ...[
    "Virginia|ACC",
    "Wake Forest|ACC",
    "North Carolina|ACC",
    "Duke|ACC",
    "Ohio State|Big Ten",
    "Michigan|Big Ten",
    "Illinois|Big Ten",
    "Florida|SEC",
    "South Carolina|SEC",
    "Kentucky|SEC",
    "Georgia|SEC",
    "Tennessee|SEC",
    "Texas|SEC",
    "TCU|Big 12",
    "Baylor|Big 12",
    "Stanford|ACC",
    "USC|Big Ten",
    "UCLA|Big Ten",
    "Cal|ACC",
    "Ole Miss|SEC",
  ].map((x, i) => {
    const [name, conference] = x.split("|");
    return {
      name: name!,
      conference: conference!,
      division: "D1",
      minUtr: 12.6 + (i < 8 ? 0.9 : 0),
      strength: 82 + (20 - i),
      /** weekly NIL money a program can offer a top recruit */
      nilWeekly: i < 5 ? 2600 : i < 12 ? 1500 : 800,
    };
  }),
  ...[
    "Barry",
    "Valdosta State",
    "Columbus State",
    "Flagler",
    "Palm Beach Atlantic",
    "West Florida",
    "Azusa Pacific",
  ].map((name, i) => ({
    name,
    conference: "D2 Independent",
    division: "D2",
    minUtr: 10.6,
    strength: 82 - i,
    nilWeekly: 260,
  })),
  ...[
    "Emory",
    "Middlebury",
    "Williams",
    "Amherst",
    "Claremont-Mudd-Scripps",
    "Bowdoin",
    "Chicago",
    "Carnegie Mellon",
    "WashU",
    "Case Western",
    "Tufts",
  ].map((name, i) => ({
    name,
    conference: i < 9 ? "UAA" : "NESCAC",
    division: "D3",
    minUtr: 7.5,
    strength: 78 - i,
    nilWeekly: 0,
  })),
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
  {
    role: "Physiotherapist",
    tiers: [
      { name: "Clinic Physio (weekends)", quality: 1, weekly: 80 },
      { name: "Sports Physiotherapist", quality: 2, weekly: 240 },
      { name: "High Performance Physio", quality: 3, weekly: 600 },
      { name: "Travelling Tour Physio", quality: 4, weekly: 1400 },
    ],
  },
];

const FIRST = [
  "Liam", "Noah", "Ethan", "Lucas", "Owen", "Mateo", "Felix", "Jonas", "Ryo", "Arjun",
  "Nathan", "Cole", "Émile", "Declan", "Kai", "Theo", "Marco", "Dylan", "Alexei", "Hugo",
  "Diego", "Rafa", "Stefan", "Milos", "Andrei", "Tomas", "Yuki", "Hyeon", "Karim", "Youssef",
  "Lorenzo", "Matteo", "Sebastian", "Jannik", "Casper", "Holger", "Emil", "Pedro", "Joao", "Nuno",
];
const LAST = [
  "Tremblay", "Nguyen", "Kowalski", "Bianchi", "Okafor", "Suzuki", "Novak", "Reyes", "Lindqvist",
  "Bhatia", "Moreau", "Zhang", "O'Brien", "Petrov", "Hausmann", "Silva", "Dubois", "Kaur",
  "Fernandez", "Vasilev", "Alcaraz-Ruiz", "Berrettini", "Van der Merwe", "Kovacevic", "Haddad",
  "El Amrani", "Sakamoto", "Park", "Rossi", "Larsen", "Schmid", "Bergman", "Costa", "Duarte",
  "Ivanov", "Marchetti", "Weiss", "Nakamura", "Rahman", "Cruz",
];

export function randomName(rng: () => number = Math.random) {
  return `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)]}`;
}
