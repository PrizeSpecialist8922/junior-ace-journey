export type Hand = "Left" | "Right";
export type Playstyle = "Serve & Volley" | "Baseline Grinder" | "All-Court" | "Counterpuncher";
export type Wealth = "Working Class" | "Middle Class" | "Affluent";
export type Phase = "junior" | "college" | "pro" | "retired";
export type StaffRole = "Private Coach" | "Fitness Trainer" | "Psychologist" | "Physiotherapist";

export type BodyArea = "Shoulder" | "Wrist" | "Back" | "Knee";
export type InjurySeverity = "Niggle" | "Strain" | "Major";

export type BodyLoad = Record<BodyArea, number>;

export interface Injury {
  area: BodyArea;
  severity: InjurySeverity;
  label: string;
  weeksOut: number;
  weeksTotal: number;
  startedAbsWeek: number;
}

export type Surface = "Indoor Hard" | "Hard" | "Clay" | "Grass";

export interface Venue {
  id: string;
  name: string;
  city: string;
  region: string;
  country: string;
  surface: Surface;
  indoor: boolean;
  /** 1 = local GTA, 2 = Ontario/Quebec, 3 = North America, 4 = intercontinental */
  travelCostTier: 1 | 2 | 3 | 4;
}


export interface PointEntry {
  /** absolute week when earned */
  week: number;
  points: number;
  event: string;
}

export interface Staff {
  id: string;
  role: StaffRole;
  name: string;
  quality: number; // 1-5
  weekly: number; // cost per week
}

export interface Partner {
  name: string;
  utr: number;
  chemistry: number; // 0-100
  titles: number;
}

export interface Trophy {
  title: string;
  kind: "OTA" | "National" | "ITF" | "College" | "Pro" | "Milestone" | "Team Canada" | "Olympic";
  age: number;
  season: number;
  detail?: string;
}

export interface MatchResult {
  round: string;
  opponent: string;
  oppUtr: number;
  score: string;
  won: boolean;
}

export interface TournamentRun {
  id: string;
  name: string;
  tier: string;
  week: number;
  age: number;
  matches: MatchResult[];
  result: string;
  points: number;
  prize: number;
  surface: Surface;
  venue: Venue;
  conditions?: Conditions;
  bracket?: BracketNode;
  doubles?: { partner: string; result: string; matches: MatchResult[] };
  projectedRank?: number;
  entry?: "direct" | "qualifying" | "wildcard";
}

export interface Attributes {
  tennis: number;
  fitness: number;
  mental: number;
  study: number;
}

export interface SurfaceForm {
  "Indoor Hard": number;
  Hard: number;
  Clay: number;
  Grass: number;
}

export interface Conditions {
  tempC: number; // temperature in Celsius
  windKph: number;
  humidity: number; // 0-100
  description: string;
}

export interface TournamentOffer {
  id: string;
  name: string;
  tier: string;
  level: number; // OTA level, or 5=ITF, 6=pro
  requirement: string;
  eligible: boolean;
  drawSize: number;
  fieldUtr: number;
  points: number; // winner points
  prize: number; // winner prize
  selectionPoints: boolean;
  doubles: boolean;
  surface: Surface;
  venue: Venue;
  travelCost: number;
  entry?: "direct" | "qualifying" | "wildcard";
  qualifyingRounds?: number;
  /** which ranking list this event feeds */
  circuit?: "OTA" | "ITF Junior" | "ATP" | "College" | "Intl Junior" | "None";
  /** notes shown under the entry requirement */
  notes?: string;
}

export interface EventResult {
  id: string;
  week: number;
  season: number;
  name: string;
  bracket: string;
  champion: string;
  runnerUp: string;
  score: string;
  semifinalists: string[];
  selectionEvent: boolean;
}

export interface Notification {
  id: string;
  kind: "selection" | "provincials" | "nationals" | "itf" | "pro" | "college" | "nil" | "general";
  title: string;
  body: string;
  tone: "good" | "bad" | "info" | "gold";
  week: number;
  age: number;
  read: boolean;
}


export interface SponsorDeal {
  id: string;
  name: string;
  weekly: number;
  requirement: string;
  minReputation: number;
}
export interface SeasonSnapshot {
  season: number;
  age: number;
  utr: number;
  rogersRank: number;
  atpRank: number;
  bank: number;
  titles: number;
  wins: number;
  losses: number;
  prize: number;
}
export interface Rival {
  name: string;
  utr: number;
  wins: number;
  losses: number;
  surfaces: Record<Surface, { wins: number; losses: number }>;
}
export interface NationalTeamState {
  active: boolean;
  caps: number;
  medals: number;
  history: string[];
  lastCallupSeason: number;
}
export interface CollegeState {
  school: string | null;
  conference: string | null;
  seasonsUsed: number;
  redshirted: boolean;
  redshirtThisSeason: boolean;
  teamWins: number;
  teamLosses: number;
  individualWins: number;
  individualLosses: number;
  conferenceChampion: boolean;
  /** weekly NIL money — only for elite recruits who keep performing */
  nilWeekly: number;
  nilOffered: number;
  lineupSpot: number;
}

export interface LineupEntry {
  spot: number;
  name: string;
  utr: number;
  isPlayer: boolean;
  year: string;
}

export interface BracketNode {
  round: string;
  opponent?: string;
  oppUtr?: number;
  score?: string;
  won?: boolean;
  children?: [BracketNode, BracketNode];
}

export interface AIPlayer {
  name: string;
  points: number;
  utr: number;
  selection?: number;
  /** deeper profile — the pool is a living world */
  age?: number;
  potential?: number; // UTR ceiling this player can reach
  phase?: "junior" | "college" | "pro" | "retired";
  playstyle?: Playstyle;
  hand?: Hand;
  region?: string;
  injuryWeeks?: number;
  peakUtr?: number;
  seasons?: number;
  /** ITF junior circuit points (singles / doubles) */
  itfPoints?: number;
  itfDoublesPoints?: number;
  country?: string;
  /** mock season record used by the selection race */
  seasonWins?: number;
  seasonLosses?: number;
}

export interface GameState {
  ontarioPool: AIPlayer[];
  atpPool: AIPlayer[];
  /** world ITF junior circuit field */
  itfPool: AIPlayer[];
  /** ITF junior ranking points, singles and doubles */
  itfSingles: PointEntry[];
  itfDoubles: PointEntry[];
  notifications: Notification[];
  eventResults: EventResult[];

  name: string;
  hand: Hand;
  playstyle: Playstyle;
  wealth: Wealth;
  allowance: number;
  age: number;
  week: number; // 1-52
  season: number;
  phase: Phase;
  attrs: Attributes;
  utr: number;
  gamesWon: number;
  gamesLost: number;
  rogers: PointEntry[];
  atp: PointEntry[];
  selection: Record<string, number>; // bracket -> points this cycle
  bank: number;
  careerPrize: number;
  gpa: number;
  fatigue: number;
  staff: Staff[];
  partner: Partner | null;
  partnerOffers: Partner[];
  trophies: Trophy[];
  log: { week: number; age: number; text: string; tone: string }[];
  runs: TournamentRun[];
  playedThisWeek: boolean;
  collegeDivision: string | null;
  collegeSuspended: boolean;
  qualifiedNationals: boolean;
  crossroadsPending: boolean;
  wins: number;
  losses: number;
  titles: number;
  surfaceForm: SurfaceForm;
  /** physical load per body area (0-100) */
  bodyLoad: BodyLoad;
  injury: Injury | null;
  injuryHistory: { label: string; area: BodyArea; weeks: number; age: number; season: number }[];
  /** match sharpness 0-100, drops during layoffs, rebuilds with matches */
  sharpness: number;
  /** short-term confidence 0-100 */
  confidence: number;
  /** long-term motivation 0-100; burnout risk when low */
  motivation: number;
  burnoutWarned: boolean;
  sponsor: SponsorDeal | null;
  sponsorReputation: number;
  racquet: string;
  stringTension: "Low" | "Medium" | "High";
  history: SeasonSnapshot[];
  yearReview: SeasonSnapshot | null;
  rivals: Rival[];
  nationalTeam: NationalTeamState;
  college: CollegeState;
}
