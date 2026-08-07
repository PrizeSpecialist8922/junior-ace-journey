export type Hand = "Left" | "Right";
export type Playstyle =
  | "Serve & Volley"
  | "Baseline Grinder"
  | "All-Court"
  | "Counterpuncher";
export type Wealth = "Working Class" | "Middle Class" | "Affluent";
export type Phase = "junior" | "college" | "pro" | "retired";
export type StaffRole = "Private Coach" | "Fitness Trainer" | "Psychologist";

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
  kind: "OTA" | "National" | "ITF" | "College" | "Pro" | "Milestone";
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
  doubles?: { partner: string; result: string; matches: MatchResult[] };
}

export interface Attributes {
  tennis: number;
  fitness: number;
  mental: number;
  study: number;
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
  surface: string;
}

export interface AIPlayer {
  name: string;
  points: number;
  utr: number;
  selection?: number;
}

export interface GameState {
  ontarioPool: AIPlayer[];
  atpPool: AIPlayer[];
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
}
