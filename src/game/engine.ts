import {
  ITF_TIERS,
  NATIONALS_WEEK,
  PROVINCIALS_WEEK,
  PRO_TIERS,
  NCAA_SCHOOLS,
  RACQUETS,
  SPONSORS,
  SELECTION_WEEKS,
  STAFF_CATALOG,
  SURFACES,
  WEALTH_ALLOWANCE,
  randomName,
  surfaceForWeek,
  venueForSurface,
  venueById,
} from "./data";
import type {
  AIPlayer,
  BodyArea,
  BracketNode,
  InjurySeverity,
  Conditions,
  GameState,
  Hand,
  Injury,
  MatchResult,
  Playstyle,
  PointEntry,
  Surface,
  TournamentOffer,
  TournamentRun,
  Venue,
  Wealth,
} from "./types";

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const r2 = (v: number) => Math.round(v * 100) / 100;

export const absWeek = (s: { age: number; week: number }) => (s.age - 4) * 52 + s.week;

/** Physical-development soft cap: juniors cannot rate like grown pros. */
export function utrCeiling(s: { age: number; phase: string }) {
  if (s.phase !== "junior") return 16.5;
  return clamp(1.5 + Math.max(0, s.age - 5) * 1.05, 1.5, 15.5);
}

export function ageBracket(age: number) {
  if (age <= 11) return "U12";
  if (age <= 13) return "U14";
  if (age <= 15) return "U16";
  return "U18";
}

/* ---------------------------------- pools --------------------------------- */

const PLAYSTYLES: Playstyle[] = [
  "Serve & Volley",
  "Baseline Grinder",
  "All-Court",
  "Counterpuncher",
];
const REGIONS = [
  "Toronto",
  "Mississauga",
  "Ottawa",
  "Hamilton",
  "London",
  "Windsor",
  "Barrie",
  "Kingston",
  "Montreal",
  "Vancouver",
];
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

function profile(): Pick<AIPlayer, "playstyle" | "hand" | "region" | "seasons" | "injuryWeeks"> {
  return {
    playstyle: pick(PLAYSTYLES),
    hand: Math.random() < 0.14 ? "Left" : "Right",
    region: pick(REGIONS),
    seasons: 0,
    injuryWeeks: 0,
  };
}

function newJunior(index: number, age?: number): AIPlayer {
  const a = age ?? Math.round(clamp(10 + rnd(0, 8), 10, 18));
  const utr = r2(clamp(11.5 * Math.exp(-index / 90) + rnd(-0.4, 0.4) + 1.6, 1, 13));
  return {
    name: randomName(),
    points: Math.round(3200 * Math.exp(-index / 55) + rnd(-40, 40) + 5),
    utr,
    selection: Math.round(Math.max(0, 900 * Math.exp(-index / 30) + rnd(-30, 30))),
    age: a,
    phase: "junior",
    potential: r2(clamp(utr + rnd(0.8, 5.2), 3, 16.2)),
    peakUtr: utr,
    ...profile(),
  };
}

function newPro(index: number): AIPlayer {
  const utr = r2(clamp(16.3 - Math.log(index + 1) * 1.05 + rnd(-0.25, 0.25), 9.5, 16.5));
  return {
    name: randomName(),
    points: Math.round(4600 * Math.exp(-index / 58) + rnd(-18, 18) + 3),
    utr,
    age: Math.round(clamp(19 + rnd(0, 15), 18, 34)),
    phase: "pro",
    potential: r2(clamp(utr + rnd(0, 1.1), 9.5, 16.6)),
    peakUtr: utr,
    ...profile(),
  };
}

function buildOntarioPool(): AIPlayer[] {
  return Array.from({ length: 300 }, (_, i) => newJunior(i)).sort((a, b) => b.points - a.points);
}

function buildAtpPool(): AIPlayer[] {
  return Array.from({ length: 500 }, (_, i) => newPro(i)).sort((a, b) => b.points - a.points);
}

/** Weekly pool movement: point decay, development, injuries. */
function evolvePool(pool: AIPlayer[]) {
  for (const p of pool) {
    const injured = (p.injuryWeeks ?? 0) > 0;
    if (injured) p.injuryWeeks = Math.max(0, (p.injuryWeeks ?? 0) - 1);
    else if (Math.random() < 0.0025) p.injuryWeeks = Math.round(rnd(2, 20));

    const decay = injured ? 0.955 : p.points < 900 ? 0.965 : 0.978;
    p.points = Math.max(1, Math.round(p.points * decay + (injured ? 0 : rnd(-18, 18))));

    // development toward potential, throttled by age and injury
    const potential = p.potential ?? p.utr;
    const age = p.age ?? 20;
    const growthRate = age < 18 ? 0.02 : age < 24 ? 0.01 : age < 29 ? 0.004 : -0.006;
    const gap = potential - p.utr;
    const move = injured ? -0.01 : gap > 0 ? Math.min(gap, growthRate) : growthRate * 0.5;
    p.utr = r2(clamp(p.utr + move, 1, 16.6));
    p.peakUtr = Math.max(p.peakUtr ?? 0, p.utr);
  }
  pool.sort((a, b) => b.points - a.points);
}

/**
 * Yearly pool turnover: everyone ages, juniors graduate to college or the tour,
 * veterans decline and retire, and new kids arrive at the bottom of the list.
 */
function agePool(pool: AIPlayer[], kind: "junior" | "pro"): string[] {
  const news: string[] = [];
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i]!;
    p.age = (p.age ?? 18) + 1;
    p.seasons = (p.seasons ?? 0) + 1;
    if (kind === "junior" && p.age > 18) {
      const goesPro = (p.potential ?? p.utr) >= 13.5 && p.utr >= 12;
      news.push(
        goesPro
          ? `${p.name} skips college and turns professional.`
          : `${p.name} ages out of juniors and accepts an NCAA scholarship.`,
      );
      pool[i] = newJunior(pool.length - 1, 10);
      continue;
    }
    if (kind === "pro" && (p.age > 34 || (p.age > 30 && p.utr < 12.5))) {
      news.push(`${p.name} retires from the pro tour at ${p.age}.`);
      pool[i] = newPro(Math.max(120, pool.length - 1));
      continue;
    }
  }
  pool.sort((a, b) => b.points - a.points);
  return news.slice(0, 3);
}

/** Pick a real pool player near a target UTR so draws are filled by the ranked world. */
function poolOpponent(s: GameState, targetUtr: number): { name: string; utr: number } {
  const pool = s.phase === "pro" && s.atpPool.length ? s.atpPool : s.ontarioPool;
  const candidates = pool.filter(
    (p) => (p.injuryWeeks ?? 0) === 0 && Math.abs(p.utr - targetUtr) < 0.9,
  );
  const chosen = candidates.length ? pick(candidates) : null;
  if (!chosen) return { name: randomName(), utr: targetUtr };
  return { name: chosen.name, utr: chosen.utr };
}

/* --------------------------------- ratings -------------------------------- */

export function activePoints(entries: PointEntry[], now: number) {
  return entries.reduce((sum, e) => (now - e.week < 52 ? sum + e.points : sum), 0);
}

export function pruneExpired(entries: PointEntry[], now: number) {
  return entries.filter((e) => now - e.week < 52);
}

export function ontarioRank(s: GameState) {
  const pts = activePoints(s.rogers, absWeek(s));
  if (pts <= 0) return 999;
  return s.ontarioPool.filter((p) => p.points > pts).length + 1;
}

export function atpRank(s: GameState) {
  const pts = activePoints(s.atp, absWeek(s));
  if (pts <= 0) return 1500;
  return s.atpPool.filter((p) => p.points > pts).length + 1;
}

export function selectionRank(s: GameState) {
  const mine = s.selection[ageBracket(s.age)] ?? 0;
  if (mine <= 0) return 999;
  return s.ontarioPool.filter((p) => (p.selection ?? 0) > mine).length + 1;
}

/* ------------------------------ match engine ------------------------------ */

function styleEdge(style: Playstyle, oppUtr: number, myUtr: number, surface: Surface) {
  let e = 0;
  if (style === "Serve & Volley" && surface.includes("Hard")) e += 0.3;
  if (style === "Serve & Volley" && surface === "Grass") e += 0.45;
  if (style === "Baseline Grinder" && surface === "Clay") e += 0.4;
  if (style === "Counterpuncher" && oppUtr > myUtr) e += 0.45;
  if (style === "All-Court") e += 0.12;
  return e;
}

function conditionsEdge(
  surfaceForm: number,
  conditions?: Conditions,
  fitness = 50,
  style: Playstyle = "All-Court",
) {
  let e = (surfaceForm - 50) / 200; // +/- 0.25 at extremes
  if (!conditions) return e;
  // heat hurts low fitness; wind hurts serve-volley; humidity is neutral flavor
  if (conditions.tempC > 30) e -= Math.max(0, (40 - fitness) / 250);
  if (conditions.windKph > 20 && style === "Serve & Volley") e -= 0.12;
  if (conditions.windKph > 20 && style === "Baseline Grinder") e += 0.04;
  return e;
}

export function rollConditions(surface: Surface, indoor: boolean): Conditions {
  const tempBase = indoor ? 20 : surface === "Clay" ? 24 : surface === "Grass" ? 22 : 26;
  const tempC = Math.round(tempBase + rnd(-8, 12));
  const windKph = indoor ? Math.round(rnd(0, 5)) : Math.round(rnd(0, 35));
  const humidity = Math.round(rnd(35, 90));
  let description = `${tempC}°C`;
  if (windKph > 25) description += ` • windy (${windKph} km/h)`;
  else if (windKph > 12) description += ` • breezy`;
  if (humidity > 75) description += ` • humid`;
  else if (humidity < 45) description += ` • dry`;
  return { tempC, windKph, humidity, description };
}

/* ------------------------- body load & injury engine ----------------------- */

export const BODY_AREAS: BodyArea[] = ["Shoulder", "Wrist", "Back", "Knee"];

const INJURY_LABELS: Record<BodyArea, Record<InjurySeverity, string>> = {
  Shoulder: {
    Niggle: "sore rotator cuff",
    Strain: "rotator cuff tendinitis",
    Major: "labral tear in the shoulder",
  },
  Wrist: {
    Niggle: "tight wrist extensor",
    Strain: "wrist tendon strain",
    Major: "torn wrist ligament",
  },
  Back: {
    Niggle: "stiff lower back",
    Strain: "lumbar muscle strain",
    Major: "stress fracture in the lower back",
  },
  Knee: {
    Niggle: "achy patellar tendon",
    Strain: "patellar tendinitis",
    Major: "meniscus tear",
  },
};

export function physioQuality(s: GameState) {
  return s.staff.filter((x) => x.role === "Physiotherapist").reduce((n, x) => Math.max(n, x.quality), 0);
}

function ensureBody(s: GameState) {
  s.bodyLoad ??= { Shoulder: 0, Wrist: 0, Back: 0, Knee: 0 };
  s.injuryHistory ??= [];
  s.sharpness ??= 100;
  s.confidence ??= 50;
  s.motivation ??= 75;
}

/** Load added by a match: sets played, surface, string tension. */
function addLoad(s: GameState, sets: number, surface: Surface) {
  ensureBody(s);
  const tension = s.stringTension === "High" ? 1.25 : s.stringTension === "Low" ? 0.9 : 1;
  const surfaceMult = surface === "Clay" ? 0.85 : surface === "Grass" ? 0.95 : 1.1;
  const base = (2.6 + sets * 1.5) * tension * surfaceMult;
  const durability = 1 - clamp(s.attrs.fitness, 0, 100) / 260; // fit players absorb load better
  s.bodyLoad.Shoulder = clamp(s.bodyLoad.Shoulder + base * 0.9 * durability, 0, 100);
  s.bodyLoad.Wrist = clamp(s.bodyLoad.Wrist + base * 0.7 * durability, 0, 100);
  s.bodyLoad.Back = clamp(s.bodyLoad.Back + base * 0.85 * durability, 0, 100);
  s.bodyLoad.Knee = clamp(s.bodyLoad.Knee + base * (surface === "Clay" ? 0.7 : 1.05) * durability, 0, 100);
}

export function injuryRisk(s: GameState) {
  ensureBody(s);
  const worst = Math.max(...BODY_AREAS.map((a) => s.bodyLoad[a]));
  const ageFactor = s.age >= 28 ? (s.age - 27) * 0.6 : 0;
  const raw =
    worst * 0.22 + s.fatigue * 0.12 + ageFactor - clamp(s.attrs.fitness, 0, 100) * 0.06 - physioQuality(s) * 1.8;
  return clamp(Math.round(raw), 0, 90);
}

/** Weekly injury roll. Returns true if a new injury was suffered. */
function rollInjury(s: GameState): boolean {
  ensureBody(s);
  if (s.injury) return false;
  const risk = injuryRisk(s) / 100;
  if (Math.random() > risk * 0.35) return false;
  const ranked: BodyArea[] = BODY_AREAS.slice().sort((a, b) => s.bodyLoad[b] - s.bodyLoad[a]);
  const area: BodyArea = (Math.random() < 0.7 ? ranked[0] : ranked[1]) ?? "Shoulder";
  const load = s.bodyLoad[area];
  const roll = Math.random();
  const severity: InjurySeverity =
    load > 78 && roll < 0.3 ? "Major" : load > 55 || roll < 0.55 ? "Strain" : "Niggle";
  const weeks =
    severity === "Major"
      ? Math.round(rnd(8, 26))
      : severity === "Strain"
        ? Math.round(rnd(1, 4))
        : Math.round(rnd(1, 2));
  const injury: Injury = {
    area,
    severity,
    label: INJURY_LABELS[area][severity],
    weeksOut: severity === "Niggle" ? 0 : weeks,
    weeksTotal: weeks,
    startedAbsWeek: absWeek(s),
  };
  s.injury = injury;
  s.bodyLoad[area] = clamp(load * 0.7, 0, 100);
  s.confidence = clamp(s.confidence - (severity === "Major" ? 22 : 8), 0, 100);
  s.motivation = clamp(s.motivation - (severity === "Major" ? 14 : 4), 0, 100);
  s.injuryHistory.unshift({
    label: injury.label,
    area,
    weeks,
    age: s.age,
    season: s.season,
  });
  pushLog(
    s,
    severity === "Niggle"
      ? `Diagnosis: ${injury.label}. You can play through it, but not at full level.`
      : `INJURED — ${injury.label}. Out for ${weeks} week${weeks === 1 ? "" : "s"}.`,
    "bad",
  );
  return true;
}

/** Weekly recovery: load drains, injuries count down, sharpness fades in layoffs. */
function recover(s: GameState, restWeek: boolean) {
  ensureBody(s);
  const physio = physioQuality(s);
  const drain = (restWeek ? 6.5 : 2.4) + physio * 1.6 + s.attrs.fitness / 45;
  for (const a of BODY_AREAS) s.bodyLoad[a] = clamp(s.bodyLoad[a] - drain, 0, 100);

  const injury = s.injury;
  if (injury) {
    if (injury.severity === "Niggle") {
      if (Math.random() < 0.6 || restWeek) {
        pushLog(s, `The ${injury.label} has settled down.`, "good");
        s.injury = null;
      }
    } else {
      injury.weeksOut = Math.max(0, injury.weeksOut - 1 - (physio >= 3 && Math.random() < 0.3 ? 1 : 0));
      for (const a of BODY_AREAS) s.bodyLoad[a] = clamp(s.bodyLoad[a] - 2.5, 0, 100);
      s.sharpness = clamp(s.sharpness - 5.5, 10, 100);
      if (injury.weeksOut <= 0) {
        pushLog(
          s,
          `Cleared to compete again after ${injury.weeksTotal} weeks (${injury.label}). Match sharpness is at ${Math.round(s.sharpness)}%.`,
          "good",
        );
        s.injury = null;
      } else {
        pushLog(s, `Rehab: ${injury.weeksOut} week(s) remaining on the ${injury.label}.`, "info");
      }
    }
  } else if (restWeek) {
    s.sharpness = clamp(s.sharpness - 1.2, 20, 100);
  }
}

export function isSidelined(s: GameState) {
  return !!s.injury && s.injury.weeksOut > 0;
}

/* ------------------------------ mental state ------------------------------ */

function updateMental(s: GameState, playedThisWeek: boolean, alloc: { tennis: number; fitness: number }) {
  ensureBody(s);
  const psych = staffMultiplier(s, "Psychologist") - 1; // 0 .. 1.1
  // confidence drifts back to the middle
  s.confidence = clamp(s.confidence + (50 - s.confidence) * 0.07 + psych * 1.5, 0, 100);

  const grind = playedThisWeek ? 2.2 : 0;
  const heavyTraining = Math.max(0, alloc.tennis + alloc.fitness - 7) * 0.5;
  const restBonus = !playedThisWeek && alloc.tennis + alloc.fitness <= 4 ? 4.5 : 0;
  s.motivation = clamp(
    s.motivation - grind - heavyTraining + restBonus + psych * 2.2 + (s.confidence - 50) / 40,
    0,
    100,
  );
  if (isSidelined(s)) s.motivation = clamp(s.motivation - 1.5, 0, 100);

  if (s.motivation < 20 && !s.burnoutWarned) {
    s.burnoutWarned = true;
    pushLog(
      s,
      "BURNOUT WARNING: you are running on empty. Rest weeks or a psychologist, or you may walk away from the sport.",
      "bad",
    );
  }
  if (s.motivation > 45) s.burnoutWarned = false;
  if (s.motivation <= 4 && s.phase === "junior" && s.age < 18 && Math.random() < 0.2) {
    s.motivation = 30;
    s.attrs.tennis = clamp(s.attrs.tennis - 3, 0, 100);
    s.fatigue = clamp(s.fatigue - 40, 0, 100);
    pushLog(s, "You took a month away from the game entirely. Burnout cost you ground.", "bad");
  }
}

function playSet(pGame: number): [number, number] {
  let a = 0;
  let b = 0;
  while (true) {
    if (Math.random() < pGame) a++;
    else b++;
    if (a >= 6 && a - b >= 2) return [a, b];
    if (b >= 6 && b - a >= 2) return [a, b];
    if (a === 6 && b === 6) return Math.random() < pGame ? [7, 6] : [6, 7];
    if (a === 7 || b === 7) return [a, b];
  }
}

export function simulateMatch(
  s: GameState,
  round: string,
  oppName: string,
  oppUtr: number,
  surface: Surface,
  conditions?: Conditions,
): MatchResult {
  const fatiguePenalty = (s.fatigue / 100) * 1.2;
  const mentalBonus = (s.attrs.mental / 100) * 0.5;
  const form = s.surfaceForm[surface] ?? 50;
  // sharpness (match rust after a layoff), confidence and playing hurt all bite
  const sharpnessPenalty = ((100 - (s.sharpness ?? 100)) / 100) * 0.7;
  const confidenceEdge = (((s.confidence ?? 50) - 50) / 100) * 0.55;
  const motivationEdge = (((s.motivation ?? 70) - 60) / 100) * 0.25;
  const niggle = s.injury && s.injury.severity === "Niggle" ? 0.55 : 0;
  const eff =
    s.utr -
    fatiguePenalty +
    mentalBonus -
    sharpnessPenalty +
    confidenceEdge +
    motivationEdge -
    niggle +
    styleEdge(s.playstyle, oppUtr, s.utr, surface) +
    conditionsEdge(form, conditions, s.attrs.fitness, s.playstyle);
  const p = 1 / (1 + Math.pow(10, (oppUtr - eff) / 2.2));
  const pGame = clamp(0.5 + (p - 0.5) * 0.62, 0.12, 0.88);

  const sets: [number, number][] = [];
  let me = 0;
  let them = 0;
  while (me < 2 && them < 2) {
    const stamina = clamp(pGame - sets.length * (0.03 - s.attrs.fitness / 3000), 0.1, 0.9);
    const set = playSet(stamina);
    if (set[0] > set[1]) me++;
    else them++;
    sets.push(set);
  }
  const gw = sets.reduce((n, x) => n + x[0], 0);
  const gl = sets.reduce((n, x) => n + x[1], 0);
  const won = me === 2;

  // UTR update: performance vs expectation on game-win ratio
  const expected = 1 / (1 + Math.pow(10, (oppUtr - s.utr) / 3));
  const actual = gw / Math.max(1, gw + gl);
  const weight = clamp(1 - Math.abs(oppUtr - s.utr) / 6, 0.25, 1);
  s.utr = r2(clamp(s.utr + 0.42 * (actual - expected) * weight, 1, utrCeiling(s) + 0.5));
  s.gamesWon += gw;
  s.gamesLost += gl;
  s.fatigue = clamp(s.fatigue + 5 + sets.length * 2, 0, 100);
  if (won) s.wins++;
  else s.losses++;

  // surface form improves with competitive reps
  const formGain = 0.4 + (won ? 0.3 : 0.1) + Math.max(0, (oppUtr - s.utr) / 10);
  s.surfaceForm[surface] = clamp((s.surfaceForm[surface] ?? 50) + formGain, 0, 100);

  // match sharpness rebuilds with competitive reps
  s.sharpness = clamp((s.sharpness ?? 100) + 6 + sets.length, 0, 100);

  // confidence swings: upsets are worth more, bad losses hurt more
  const gap = oppUtr - s.utr;
  const swing = won ? 4 + Math.max(0, gap) * 3.5 : -(4 + Math.max(0, -gap) * 3.5);
  s.confidence = clamp((s.confidence ?? 50) + swing, 0, 100);

  // physical load: long matches, hard courts and tight strings punish the body
  addLoad(s, sets.length, surface);

  return {
    round,
    opponent: oppName,
    oppUtr: r2(oppUtr),
    score: sets.map((x) => `${x[0]}-${x[1]}`).join(", "),
    won,
  };
}

/* ----------------------------- tournament list ---------------------------- */

function travelCost(venue: Venue): number {
  const base: Record<Venue["travelCostTier"], number> = { 1: 0, 2: 180, 3: 900 };
  return base[venue.travelCostTier];
}

function baseOffer(
  partial: Omit<TournamentOffer, "venue" | "travelCost">,
  week: number,
): TournamentOffer {
  const venue = venueForSurface(partial.surface);
  return {
    ...partial,
    venue,
    travelCost: travelCost(venue),
  };
}

export function tierUnlocks(s: GameState) {
  const rank = ontarioRank(s);
  return {
    l1: s.age >= 10,
    l2: s.age >= 10 && (rank >= 31 || rank === 999),
    l3: s.age >= 10 && (rank <= 100 || s.utr > 3.5),
    l35: s.age >= 10 && (rank <= 50 || s.utr > 6.0),
    l4: s.age >= 10 && rank <= 32,
    itf: s.age >= 13,
    rank,
  };
}

const INDOOR_VENUES = ["ontario-racquet-club", "toronto-cricket", "cedar-springs", "ra-centre"];
const CLAY_VENUE = "london-tennis-club";
const GRASS_VENUE = "niagara-tennis";
const SUMMER_HARD_VENUES = ["sobeys-stadium", "niagara-tennis", "barrie-tennis", "windsor-tennis"];

function venueForWeek(week: number, surface: Surface) {
  if (surface === "Indoor Hard") {
    return venueById(INDOOR_VENUES[week % INDOOR_VENUES.length]!);
  }
  if (surface === "Clay") return venueById(CLAY_VENUE);
  if (surface === "Grass") return venueById(GRASS_VENUE);
  return venueById(SUMMER_HARD_VENUES[week % SUMMER_HARD_VENUES.length]!);
}

function juniorEventName(level: number, week: number, surface: Surface, br: string): string {
  const venue = venueForWeek(week, surface);
  const season =
    week <= 14
      ? "Winter Indoor"
      : week <= 24
        ? "Spring Clay"
        : week <= 30
          ? "Summer Grass"
          : "Summer/Fall";
  if (level === 1) return `Rogers First Set Tour ${br} — ${venue.city}`;
  if (level === 2) return `Nike Transition Tour ${br} — ${venue.city}`;
  if (level === 3) return `OTA Provincial Circuit ${br} — ${venue.city}`;
  if (level === 3.5) return `OTA Provincial Circuit + ${br} — ${venue.city}`;
  if (level === 4 && SELECTION_WEEKS.includes(week)) {
    return `OTA Selection Series ${br} — ${venue.name}`;
  }
  if (week === PROVINCIALS_WEEK) return `Ontario Provincial Championships ${br} — ${venue.name}`;
  if (week === NATIONALS_WEEK) return `National Bank Junior Nationals ${br} — ${venue.name}`;
  return `OTA Event ${br}`;
}

export function listTournaments(s: GameState): TournamentOffer[] {
  const out: TournamentOffer[] = [];
  const surface = surfaceForWeek(s.week);
  const u = tierUnlocks(s);
  const br = ageBracket(s.age);
  const teamEligible =
    s.phase === "junior"
      ? s.age >= 12 && (ontarioRank(s) <= 20 || s.utr >= 8)
      : s.phase === "pro" && atpRank(s) <= 250;
  if (s.week === 36 && teamEligible) {
    const venue = venueById("national-tennis-centre");
    return [
      baseOffer(
        {
          id: "team-canada",
          name:
            s.phase === "junior"
              ? "Junior Davis / Billie Jean King Cup"
              : "Davis / Billie Jean King Cup",
          tier: "Team Canada",
          level: 6.5,
          requirement: "Selected to represent Canada",
          eligible: true,
          drawSize: 8,
          fieldUtr: s.phase === "pro" ? 14 : 10,
          points: 0,
          prize: s.phase === "pro" ? 25000 : 0,
          selectionPoints: false,
          doubles: false,
          surface: "Hard",
        },
        s.week,
      ),
    ];
  }
  if (
    s.phase === "pro" &&
    s.season % 4 === 0 &&
    s.week === 30 &&
    (atpRank(s) <= 56 || (s.season + s.age) % 5 === 0)
  ) {
    const venue = venueById("sobeys-stadium");
    return [
      baseOffer(
        {
          id: "olympics",
          name: "Olympic Tennis — Team Canada",
          tier: "Olympic Games",
          level: 7,
          requirement: atpRank(s) <= 56 ? "ATP Top 56 qualified" : "Continental wildcard",
          eligible: true,
          drawSize: 64,
          fieldUtr: 14.8,
          points: 0,
          prize: 0,
          selectionPoints: false,
          doubles: false,
          surface: "Hard",
        },
        s.week,
      ),
    ];
  }
  if (s.phase === "pro") {
    const rank = atpRank(s);
    PRO_TIERS.forEach((t, i) => {
      const venue = venueForWeek(s.week, surface);
      out.push(
        baseOffer(
          {
            id: `pro-${i}`,
            name: `${t.name} — ${venue.city}`,
            tier: t.name,
            level: 6,
            requirement:
              rank <= t.rank
                ? `Direct entry (ATP #${rank})`
                : i >= 2 && i <= 4
                  ? "Qualifying available — win 2 matches"
                  : `ATP rank ${t.rank} or better`,
            eligible: rank <= t.rank || (i >= 2 && i <= 4),
            entry:
              rank <= t.rank
                ? "direct"
                : (s.season + s.week + i) % 7 === 0 &&
                    ["sobeys-stadium", "national-tennis-centre"].includes(venue.id)
                  ? "wildcard"
                  : "qualifying",
            qualifyingRounds: rank <= t.rank ? 0 : 2,
            drawSize: t.drawSize,
            fieldUtr: t.utr,
            points: t.points,
            prize: t.prize,
            selectionPoints: false,
            doubles: true,
            surface,
          },
          s.week,
        ),
      );
    });
    return out;
  }

  if (s.phase === "college") {
    const venue = venueForWeek(s.week, surface);
    out.push(
      baseOffer(
        {
          id: "college-dual",
          name:
            s.week === 21
              ? `${s.collegeDivision} ${s.college.conference} Conference Championship`
              : s.week === 22
                ? `NCAA ${s.collegeDivision} National Championships`
                : `${s.college.school ?? `NCAA ${s.collegeDivision}`} vs ${NCAA_SCHOOLS.filter((x) => x.division === s.collegeDivision && x.name !== s.college.school)[s.week % Math.max(1, NCAA_SCHOOLS.filter((x) => x.division === s.collegeDivision).length)]?.name ?? "Conference Rival"}`,
          tier: `NCAA ${s.collegeDivision}`,
          level: 5.5,
          requirement: s.collegeSuspended
            ? "Suspended — GPA below 2.0"
            : "Roster member in good standing",
          eligible:
            !s.collegeSuspended && !s.college.redshirtThisSeason && s.week >= 8 && s.week <= 22,
          drawSize: 4,
          fieldUtr: s.collegeDivision === "D1" ? 13.2 : s.collegeDivision === "D2" ? 11.0 : 8.0,
          points: 0,
          prize: 0,
          selectionPoints: false,
          doubles: true,
          surface,
        },
        s.week,
      ),
    );
    ITF_TIERS.slice(0, 3).forEach((t, i) => {
      const itfSurface = SURFACES[i % SURFACES.length] as Surface;
      const itfVenue = venueForWeek(s.week + i, itfSurface);
      out.push(
        baseOffer(
          {
            id: `sum-itf-${i}`,
            name: `${t.name} — ${itfVenue.city}`,
            tier: t.name.replace("ITF J", "ITF Futures-style Open "),
            level: 5,
            requirement: `UTR ${t.utr.toFixed(2)}+ field`,
            eligible: s.utr >= t.utr - 1.5,
            drawSize: 32,
            fieldUtr: t.utr,
            points: 0,
            prize: t.points * 40,
            selectionPoints: false,
            doubles: false,
            surface: itfSurface,
          },
          s.week,
        ),
      );
    });
    return out;
  }

  if (s.age < 10) {
    const venue = venueById("ontario-racquet-club");
    out.push(
      baseOffer(
        {
          id: "prog",
          name:
            s.age <= 6
              ? "Red Ball Progressive Tennis Festival"
              : s.age <= 8
                ? "Orange Ball Club Team Event"
                : "Green Dot Local Team Challenge",
          tier: "Progressive Tennis (non-sanctioned)",
          level: 0,
          requirement: "Open to all club juniors — no ranking",
          eligible: true,
          drawSize: 4,
          fieldUtr: clamp(s.utr + 0.3, 1, 4),
          points: 0,
          prize: 0,
          selectionPoints: false,
          doubles: false,
          surface: "Indoor Hard",
        },
        s.week,
      ),
    );
    return out;
  }

  out.push(
    baseOffer(
      {
        id: "l1",
        name: juniorEventName(1, s.week, surface, br),
        tier: "Level 1 — Rookie Tour",
        level: 1,
        requirement: "Entry level. No restriction.",
        eligible: u.l1,
        drawSize: 4,
        fieldUtr: clamp(s.utr + rnd(-0.4, 0.6), 1, 6),
        points: 0,
        prize: 0,
        selectionPoints: false,
        doubles: false,
        surface,
      },
      s.week,
    ),
  );
  out.push(
    baseOffer(
      {
        id: "l2",
        name: juniorEventName(2, s.week, surface, br),
        tier: "Level 2 — Nike Transition Tour",
        level: 2,
        requirement: "Ontario ranking 31st or lower in age group",
        eligible: u.l2,
        drawSize: 16,
        fieldUtr: clamp(3.2 + s.age * 0.1, 2, 7),
        points: 40,
        prize: 0,
        selectionPoints: false,
        doubles: false,
        surface,
      },
      s.week,
    ),
  );
  out.push(
    baseOffer(
      {
        id: "l3",
        name: juniorEventName(3, s.week, surface, br),
        tier: "Level 3 — Provincial Circuit",
        level: 3,
        requirement: "Top 100 Ontario or UTR 3.50+",
        eligible: u.l3,
        drawSize: 32,
        fieldUtr: clamp(4.6 + s.age * 0.14, 3, 9),
        points: 120,
        prize: 0,
        selectionPoints: false,
        doubles: false,
        surface,
      },
      s.week,
    ),
  );
  out.push(
    baseOffer(
      {
        id: "l35",
        name: juniorEventName(3.5, s.week, surface, br),
        tier: "Level 3.5 — Provincial Circuit Plus",
        level: 3.5,
        requirement: "Top 50 Ontario or UTR 6.00+",
        eligible: u.l35,
        drawSize: 32,
        fieldUtr: clamp(6.2 + s.age * 0.16, 4, 11),
        points: 260,
        prize: 0,
        selectionPoints: false,
        doubles: true,
        surface,
      },
      s.week,
    ),
  );

  if (SELECTION_WEEKS.includes(s.week)) {
    const indoor = s.week < 20 || s.week > 40;
    const selSurface: Surface = indoor ? "Indoor Hard" : "Hard";
    out.push(
      baseOffer(
        {
          id: "l4",
          name: juniorEventName(4, s.week, selSurface, br),
          tier: "Level 4.0 — Selection Series",
          level: 4,
          requirement: "Top 32 Ontario Rogers Ranking",
          eligible: u.l4,
          drawSize: 32,
          fieldUtr: clamp(7.6 + s.age * 0.18, 5, 12.5),
          points: 700,
          prize: 0,
          selectionPoints: true,
          doubles: true,
          surface: selSurface,
        },
        s.week,
      ),
    );
  }
  if (s.week === PROVINCIALS_WEEK) {
    const provVenue = venueById("ontario-racquet-club");
    out.push(
      baseOffer(
        {
          id: "provincials",
          name: `Ontario Provincial Championships ${br} — ${provVenue.name}`,
          tier: "OTA Provincial Championship",
          level: 4,
          requirement: "Top 64 Ontario Rogers Ranking",
          eligible: u.rank <= 64,
          drawSize: 64,
          fieldUtr: clamp(8.0 + s.age * 0.18, 5, 13),
          points: 900,
          prize: 0,
          selectionPoints: true,
          doubles: true,
          surface: "Indoor Hard",
        },
        s.week,
      ),
    );
  }
  if (s.week === NATIONALS_WEEK) {
    const natVenue = venueById("national-tennis-centre");
    out.push(
      baseOffer(
        {
          id: "nationals",
          name: `National Bank Junior Nationals ${br} — ${natVenue.name}`,
          tier: "Tennis Canada National Championship",
          level: 4,
          requirement: s.qualifiedNationals
            ? "QUALIFIED — Top 16 Ontario selection points (Main Draw)"
            : "Top 16 Ontario selection points required",
          eligible: s.qualifiedNationals,
          drawSize: 64,
          fieldUtr: clamp(8.8 + s.age * 0.2, 6, 13.5),
          points: 1200,
          prize: 0,
          selectionPoints: false,
          doubles: true,
          surface: "Indoor Hard",
        },
        s.week,
      ),
    );
  }

  if (u.itf) {
    ITF_TIERS.forEach((t, i) => {
      const itfSurface = SURFACES[i % SURFACES.length] as Surface;
      const itfVenue = venueForWeek(s.week + i, itfSurface);
      out.push(
        baseOffer(
          {
            id: `itf-${i}`,
            name: `${t.name} — ${itfVenue.city}`,
            tier: `ITF Junior ${t.name.replace("ITF ", "")}`,
            level: 5,
            requirement: `UTR ${t.utr.toFixed(2)}+ (age 13-18 only)`,
            eligible: s.utr >= t.utr - 0.75,
            drawSize: t.drawSize,
            fieldUtr: t.utr,
            points: Math.round(t.points * 0.9),
            prize: 0,
            selectionPoints: false,
            doubles: t.points >= 100,
            surface: itfSurface,
          },
          s.week,
        ),
      );
    });
  }

  // Every event in the current week remains visible: entry and travel are handled when Play is pressed.
  return out;
}

/* --------------------------- tournament execution ------------------------- */

const RESULT_SHARE: Record<string, number> = {
  W: 1,
  F: 0.78,
  SF: 0.52,
  QF: 0.3,
  R16: 0.15,
  R32: 0.06,
  R64: 0.025,
  RR: 0,
};

function roundNames(drawSize: number) {
  const names: string[] = [];
  let n = drawSize;
  while (n > 1) {
    names.push(
      n === 2 ? "Final" : n === 4 ? "Semifinal" : n === 8 ? "Quarterfinal" : `Round of ${n}`,
    );
    n /= 2;
  }
  return names;
}

function resultCode(drawSize: number, roundsWon: number) {
  const total = Math.log2(drawSize);
  if (roundsWon >= total) return "W";
  const left = total - roundsWon;
  return (["F", "SF", "QF", "R16", "R32", "R64", "R128"] as const)[left - 1] ?? "R128";
}

function buildBracket(drawSize: number, matches: MatchResult[], playerName: string): BracketNode {
  const names = roundNames(drawSize);
  // Build a simple binary tree where the player's path is on the left side of each node they win
  function node(roundIndex: number, matchIndex: number): BracketNode {
    const round = names[roundIndex] ?? "Final";
    const m = matches[roundIndex];
    if (!m) {
      // filler opponent for unplayed rounds
      return { round };
    }
    const children: [BracketNode, BracketNode] = [
      {
        round: names[roundIndex - 1] ?? "",
        opponent: m.opponent,
        oppUtr: m.oppUtr,
        score: m.score,
        won: m.won,
      },
      { round: names[roundIndex - 1] ?? "", opponent: randomName() },
    ];
    return {
      round,
      opponent: m.opponent,
      oppUtr: m.oppUtr,
      score: m.score,
      won: m.won,
      children,
    };
  }
  // Simpler: build from the deepest played round outward
  let deepest = matches.length - 1;
  while (deepest >= 0 && !matches[deepest]) deepest--;
  if (deepest < 0) return { round: names[0] ?? "Final" };

  let root: BracketNode = {
    round: matches[deepest]!.round,
    opponent: matches[deepest]!.opponent,
    oppUtr: matches[deepest]!.oppUtr,
    score: matches[deepest]!.score,
    won: matches[deepest]!.won,
  };
  for (let i = deepest - 1; i >= 0; i--) {
    const m = matches[i]!;
    root = {
      round: m.round,
      opponent: m.opponent,
      oppUtr: m.oppUtr,
      score: m.score,
      won: m.won,
      children: [root, { round: m.round, opponent: randomName() }],
    };
  }
  return root;
}

export function playTournament(s: GameState, offer: TournamentOffer): TournamentRun {
  const matches: MatchResult[] = [];
  const log = (t: string, tone = "info") => pushLog(s, t, tone);
  const conditions = rollConditions(offer.surface, offer.venue.indoor);

  // travel logistics
  s.bank -= offer.travelCost;
  if (offer.travelCost > 0) {
    const travelFatigue = offer.venue.travelCostTier * 3;
    s.fatigue = clamp(s.fatigue + travelFatigue, 0, 100);
    log(`Travelled to ${offer.venue.city} for ${offer.name} ($${offer.travelCost}).`, "info");
  }

  let result = "";
  let earned = 0;
  let prize = 0;

  if (offer.level === 0 || offer.id === "l1" || offer.id === "college-dual") {
    // round robin / dual match: guaranteed 3 matches, no ranking points
    let wins = 0;
    for (let i = 0; i < 3; i++) {
      const m = simulateMatch(
        s,
        `Round Robin ${i + 1}`,
        randomName(),
        clamp(offer.fieldUtr + rnd(-0.7, 0.9), 1, 16.5),
        offer.surface,
        conditions,
      );
      matches.push(m);
      if (m.won) wins++;
    }
    result = `${wins}-${3 - wins} in round robin`;
    s.attrs.tennis = clamp(s.attrs.tennis + 0.8 + wins * 0.4, 0, 100);
    if (wins === 3 && offer.level === 1) {
      s.titles++;
      s.trophies.push({
        title: `${offer.name} — Perfect Round Robin`,
        kind: "OTA",
        age: s.age,
        season: s.season,
        detail: `${offer.venue.city} • ${offer.surface}`,
      });
    }
  } else {
    if (offer.entry === "qualifying") {
      for (let q = 1; q <= (offer.qualifyingRounds ?? 2); q++) {
        const qm = simulateMatch(
          s,
          `Qualifying ${q}`,
          randomName(),
          clamp(offer.fieldUtr - 1.1 + q * 0.25, 1, 16.5),
          offer.surface,
          conditions,
        );
        matches.push(qm);
        if (!qm.won) {
          result = `Lost in Qualifying ${q}`;
          break;
        }
      }
      if (matches.some((m) => m.round.startsWith("Qualifying") && !m.won)) {
        const run: TournamentRun = {
          id: `${offer.id}-${absWeek(s)}`,
          name: offer.name,
          tier: offer.tier,
          week: s.week,
          age: s.age,
          matches,
          result,
          points: 0,
          prize: 0,
          surface: offer.surface,
          venue: offer.venue,
          conditions,
          entry: "qualifying",
          projectedRank: atpRank(s),
        };
        s.runs.unshift(run);
        s.playedThisWeek = true;
        s.losses++;
        pushLog(s, `${offer.name}: ${result}.`, "bad");
        return run;
      }
      pushLog(s, `Qualified for the ${offer.name} main draw.`, "good");
    }
    const names = roundNames(offer.drawSize);
    let roundsWon = 0;
    for (let i = 0; i < names.length; i++) {
      const step = i / Math.max(1, names.length - 1);
      const oppUtr = clamp(offer.fieldUtr - 1.0 + step * 2.6 + rnd(-0.4, 0.4), 1, 16.5);
      const rival = s.rivals[(s.week + i) % s.rivals.length];
      const useRival = rival && (s.week + i) % 3 === 0;
      const opponent = useRival ? rival.name : randomName();
      const m = simulateMatch(
        s,
        names[i]!,
        opponent,
        useRival ? clamp(rival.utr, 1, 16.5) : oppUtr,
        offer.surface,
        conditions,
      );
      matches.push(m);
      if (useRival) {
        rival[m.won ? "losses" : "wins"]++;
        rival.surfaces[offer.surface][m.won ? "losses" : "wins"]++;
        rival.utr = r2(clamp(rival.utr + 0.01, 1, 16.5));
      }
      if (!m.won) break;
      roundsWon++;
    }
    const code = resultCode(offer.drawSize, roundsWon);
    result =
      code === "W"
        ? "CHAMPION"
        : code === "F"
          ? "Runner-up"
          : code === "SF"
            ? "Semifinalist"
            : code === "QF"
              ? "Quarterfinalist"
              : `Lost in ${code}`;
    const share = RESULT_SHARE[code] ?? 0;
    const mainWins = matches.filter((m) => !m.round.startsWith("Qualifying") && m.won).length;
    const roundAwards =
      offer.level === 6
        ? Array.from({ length: mainWins }, (_, i) =>
            Math.max(1, Math.round(offer.points * [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45][i]!)),
          )
        : [];
    earned =
      offer.level === 6
        ? Math.max(
            Math.round(offer.points * share),
            roundAwards.reduce((a, b) => a + b, 0),
          )
        : Math.round(offer.points * share);
    prize = Math.round(offer.prize * (share === 1 ? 1 : share * 0.9));

    if (code === "W") {
      s.titles++;
      s.trophies.push({
        title: offer.name,
        kind:
          offer.id === "olympics"
            ? "Olympic"
            : offer.id === "team-canada"
              ? "Team Canada"
              : offer.id === "nationals"
                ? "National"
                : offer.level === 5
                  ? "ITF"
                  : offer.level === 6
                    ? "Pro"
                    : "OTA",
        age: s.age,
        season: s.season,
        detail: `${offer.tier} • ${offer.surface} • ${offer.venue.city}`,
      });
    }
  }

  const now = absWeek(s);
  if (earned > 0) {
    if (s.phase === "pro") s.atp.push({ week: now, points: earned, event: offer.name });
    else s.rogers.push({ week: now, points: earned, event: offer.name });
  }
  if (offer.selectionPoints && earned > 0) {
    const br = ageBracket(s.age);
    s.selection[br] = (s.selection[br] ?? 0) + Math.round(earned * 0.8);
  }
  if (prize > 0) {
    s.bank += prize;
    s.careerPrize += prize;
  }

  const bracket =
    offer.level > 0 && offer.id !== "l1" && offer.id !== "college-dual"
      ? buildBracket(offer.drawSize, matches, s.name)
      : undefined;
  const run: TournamentRun = {
    id: `${offer.id}-${now}`,
    name: offer.name,
    tier: offer.tier,
    week: s.week,
    age: s.age,
    matches,
    result,
    points: earned,
    prize,
    surface: offer.surface,
    venue: offer.venue,
    conditions,
    ...(offer.entry ? { entry: offer.entry } : {}),
    projectedRank: s.phase === "pro" ? atpRank(s) : ontarioRank(s),
    ...(bracket ? { bracket } : {}),
  };

  if (offer.id === "team-canada" || offer.id === "olympics") {
    s.nationalTeam.active = true;
    s.nationalTeam.caps++;
    s.nationalTeam.lastCallupSeason = s.season;
    s.nationalTeam.history.unshift(`${offer.name} — ${result}`);
    if (result === "CHAMPION" || result === "Runner-up" || result === "Semifinalist")
      s.nationalTeam.medals++;
  }

  // doubles
  if (offer.doubles && s.partner) {
    const dm: MatchResult[] = [];
    const teamUtr = (s.utr + s.partner.utr) / 2 + s.partner.chemistry / 120;
    let r = 0;
    const dNames = roundNames(Math.min(16, offer.drawSize));
    for (let i = 0; i < dNames.length; i++) {
      const oppUtr = clamp(offer.fieldUtr - 0.8 + (i / dNames.length) * 2.2, 1, 16.5);
      const p = 1 / (1 + Math.pow(10, (oppUtr - teamUtr) / 2.4));
      const won = Math.random() < p;
      dm.push({
        round: dNames[i]!,
        opponent: `${randomName()} / ${randomName()}`,
        oppUtr: r2(oppUtr),
        score: won ? "6-4, 7-5" : "4-6, 5-7",
        won,
      });
      if (!won) break;
      r++;
    }
    const champs = r >= dNames.length;
    s.partner.chemistry = clamp(s.partner.chemistry + 4 + r * 3, 0, 100);
    if (champs) {
      s.partner.titles++;
      s.titles++;
      s.trophies.push({
        title: `${offer.name} — Doubles Title`,
        kind: "OTA",
        age: s.age,
        season: s.season,
        detail: `with ${s.partner.name} • ${offer.venue.city}`,
      });
    }
    run.doubles = {
      partner: s.partner.name,
      result: champs ? "CHAMPIONS" : `Lost in ${dm[dm.length - 1]!.round}`,
      matches: dm,
    };
  }

  s.runs.unshift(run);
  s.playedThisWeek = true;
  const matchWins = matches.filter((m) => m.won).length;
  s.sponsorReputation = clamp(
    s.sponsorReputation + matchWins * 1.5 - (matches[0]?.won ? 0 : 1),
    0,
    100,
  );
  if (s.phase === "college") {
    const won = matchWins >= 2;
    s.college[won ? "teamWins" : "teamLosses"]++;
    s.college[won ? "individualWins" : "individualLosses"]++;
    if (offer.name.includes("Championship") && won) {
      s.college.conferenceChampion = true;
      s.trophies.push({
        title: offer.name,
        kind: "College",
        age: s.age,
        season: s.season,
        detail: "Conference Champion and NCAA automatic bid",
      });
    }
  }
  log(
    `${offer.name}: ${result}${earned ? ` (+${earned} ranking pts)` : ""}${
      prize ? ` • $${prize.toLocaleString()} prize money` : ""
    }`,
    result === "CHAMPION" ? "good" : matches.some((m) => m.won) ? "info" : "bad",
  );
  if (run.doubles) log(`Doubles with ${run.doubles.partner}: ${run.doubles.result}`, "info");
  return run;
}

/* --------------------------------- weekly --------------------------------- */

export function pushLog(s: GameState, text: string, tone = "info") {
  s.log.unshift({ week: s.week, age: s.age, text, tone });
  if (s.log.length > 220) s.log.pop();
}

const CHILD_LOGS = [
  "Community club lesson: mini-court rallies with red balls and foam targets.",
  "Progressive tennis group — learned to serve underhand over a lowered net.",
  "Orange ball rally ladder at the club; you out-rallied the older group.",
  "Green dot ball introduced — first taste of a full-size court.",
  "Local non-sanctioned team event: your club team won the ribbon round.",
  "Parents drove you to a weekend club clinic; footwork ladders all morning.",
  "Backyard wall practice: 500 forehands before dinner.",
  "Coach noted your grip is finally staying semi-western under pressure.",
];

export function staffMultiplier(s: GameState, role: string) {
  const q = s.staff.filter((x) => x.role === role).reduce((n, x) => Math.max(n, x.quality), 0);
  return 1 + q * 0.22;
}

export function weeklyStaffCost(s: GameState) {
  return s.staff.reduce((n, x) => n + x.weekly, 0);
}

export function nextWeek(s: GameState, alloc: { tennis: number; fitness: number; study: number }) {
  const now = absWeek(s);
  s.rogers = pruneExpired(s.rogers, now);
  s.atp = pruneExpired(s.atp, now);

  // income & expenses
  if (!s.sponsor && s.age <= 18) s.bank += s.allowance;
  if (s.sponsor) s.bank += s.sponsor.weekly;
  const cost = weeklyStaffCost(s);
  s.bank -= cost;
  if (s.bank < 0) {
    const dropped = s.staff.pop();
    if (dropped) {
      s.bank += dropped.weekly;
      pushLog(
        s,
        `Could not afford ${dropped.name} (${dropped.role}) — contract terminated.`,
        "bad",
      );
    }
    s.bank = Math.max(0, s.bank);
  }

  // training
  const cm = staffMultiplier(s, "Private Coach");
  const fm = staffMultiplier(s, "Fitness Trainer");
  const pm = staffMultiplier(s, "Psychologist");
  const tired = 1 - s.fatigue / 220;
  const youth = s.age < 20 ? 1 : Math.max(0.35, 1 - (s.age - 20) * 0.06);
  // diminishing returns: the closer to the cap, the slower the growth
  const dim = (v: number) => Math.pow(1 - v / 100, 1.6);
  s.attrs.tennis = clamp(
    s.attrs.tennis + alloc.tennis * 0.075 * cm * tired * youth * dim(s.attrs.tennis),
    0,
    100,
  );
  s.attrs.fitness = clamp(
    s.attrs.fitness + alloc.fitness * 0.08 * fm * tired * youth * dim(s.attrs.fitness),
    0,
    100,
  );
  s.attrs.mental = clamp(
    s.attrs.mental + (alloc.study * 0.03 + 0.05) * pm * dim(s.attrs.mental),
    0,
    100,
  );
  s.attrs.study = clamp(s.attrs.study + alloc.study * 0.12 * dim(s.attrs.study), 0, 100);
  // UTR ceiling from raw ability: training alone cannot make you a tour player
  const ceiling = 1 + (s.attrs.tennis * 0.09 + s.attrs.fitness * 0.035 + s.attrs.mental * 0.025);
  const headroom = Math.max(0, Math.min(ceiling, utrCeiling(s)) - s.utr);
  s.utr = r2(
    clamp(
      s.utr + Math.min(headroom, alloc.tennis * 0.0045 * cm + alloc.fitness * 0.0015 * fm),
      1,
      16.5,
    ),
  );

  if (s.phase === "college") {
    const drift = (alloc.study - 3.2) * 0.055;
    s.gpa = clamp(r2(s.gpa + drift), 0, 4);
    if (s.gpa < 2 && !s.collegeSuspended) {
      s.collegeSuspended = true;
      pushLog(s, `GPA fell to ${s.gpa.toFixed(2)} — you are SUSPENDED from the team.`, "bad");
    } else if (s.gpa >= 2 && s.collegeSuspended) {
      s.collegeSuspended = false;
      pushLog(s, `GPA back to ${s.gpa.toFixed(2)} — reinstated on the roster.`, "good");
    }
  }

  // recovery / fatigue
  const rest = s.playedThisWeek ? 4 : 13 + s.attrs.fitness / 12;
  s.fatigue = clamp(s.fatigue - rest + alloc.fitness * 0.9 + alloc.tennis * 0.7, 0, 100);

  if (s.age < 10 && Math.random() < 0.75) {
    pushLog(s, CHILD_LOGS[Math.floor(Math.random() * CHILD_LOGS.length)]!, "info");
    s.attrs.tennis = clamp(s.attrs.tennis + 0.2, 0, 100);
    s.utr = r2(clamp(s.utr + 0.008, 1, utrCeiling(s)));
  }

  evolvePool(s.ontarioPool);
  if (s.phase === "pro") evolvePool(s.atpPool);

  if (s.week === 35) {
    const eligible =
      s.phase === "junior"
        ? s.age >= 12 && (ontarioRank(s) <= 20 || s.utr >= 8)
        : s.phase === "pro" && atpRank(s) <= 250;
    if (eligible) {
      s.nationalTeam.active = true;
      pushLog(
        s,
        `You have been selected to represent Canada at the ${s.phase === "junior" ? "Junior Davis / Billie Jean King Cup" : "Davis / Billie Jean King Cup"}.`,
        "good",
      );
    }
  }
  s.playedThisWeek = false;
  s.week++;

  if (s.week === NATIONALS_WEEK - 1 && s.phase === "junior" && s.age >= 10) {
    const rank = selectionRank(s);
    s.qualifiedNationals = rank <= 16;
    pushLog(
      s,
      s.qualifiedNationals
        ? `Selection race closed: #${rank} in Ontario ${ageBracket(s.age)} — MAIN DRAW at National Bank Junior Nationals (qualifying bypassed).`
        : `Selection race closed: #${rank === 999 ? "unranked" : rank} in Ontario ${ageBracket(s.age)} — missed the Top 16 cut for Junior Nationals.`,
      s.qualifiedNationals ? "good" : "bad",
    );
  }

  if (s.week > 52) {
    const snapshot = {
      season: s.season,
      age: s.age,
      utr: s.utr,
      rogersRank: ontarioRank(s),
      atpRank: atpRank(s),
      bank: Math.round(s.bank),
      titles: s.titles,
      wins: s.wins,
      losses: s.losses,
      prize: s.careerPrize,
    };
    s.history.push(snapshot);
    s.yearReview = snapshot;
    s.week = 1;
    s.age++;
    s.season++;
    s.selection = {};
    s.qualifiedNationals = false;
    s.rivals.forEach((r) => {
      r.utr = r2(clamp(r.utr + rnd(0.2, 0.65), 1, 16.5));
    });
    if (s.phase === "college" && !s.college.redshirtThisSeason) s.college.seasonsUsed++;
    s.college.redshirtThisSeason = false;
    pushLog(s, `— Season ${s.season} begins. You are now ${s.age} years old. —`, "good");
    if (s.age === 10)
      pushLog(
        s,
        "OTA sanctioned tournaments unlocked: you may now enter the Rogers First Set Tour.",
        "good",
      );
    if (s.age === 13)
      pushLog(s, "You turned 13 — the ITF Junior Circuit (J30-J500) is now open to you.", "good");
    if (s.age === 18 && s.phase === "junior") {
      s.crossroadsPending = true;
      pushLog(s, "AGE 18 CROSSROADS: choose college tennis or turn professional.", "good");
    }
    if (s.phase === "college" && s.age >= 22) {
      s.phase = "pro";
      s.atpPool = buildAtpPool();
      pushLog(s, "College eligibility complete — you are turning professional.", "good");
      s.trophies.push({
        title: `NCAA ${s.collegeDivision} Career Complete`,
        kind: "College",
        age: s.age,
        season: s.season,
        detail: `Final GPA ${s.gpa.toFixed(2)}`,
      });
    }
    if (s.phase === "pro" && s.age >= 35) {
      s.phase = "retired";
      pushLog(s, "You announce your retirement from professional tennis.", "good");
    }
  }
}

/* ------------------------------ college fork ------------------------------ */

export function collegeOptions(utr: number) {
  return [
    { div: "D3", ok: utr >= 5 && utr <= 8.5, range: "UTR 5.00 – 8.50" },
    { div: "D2", ok: utr >= 8.51 && utr <= 11.5, range: "UTR 8.51 – 11.50" },
    { div: "D1", ok: utr >= 11.51, range: "UTR 11.51+" },
  ];
}

export function recruitingSchools(utr: number) {
  return NCAA_SCHOOLS.filter((x) => utr >= x.minUtr)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 12);
}

export function chooseCollege(s: GameState, div: string, school?: string) {
  s.phase = "college";
  s.collegeDivision = div;
  const picked =
    NCAA_SCHOOLS.find((x) => x.name === school) ?? NCAA_SCHOOLS.find((x) => x.division === div)!;
  s.college.school = picked.name;
  s.college.conference = picked.conference;
  s.gpa = 3.0;
  s.crossroadsPending = false;
  pushLog(s, `Signed a NCAA ${div} tennis scholarship. GPA must stay above 2.00.`, "good");
}

export function goPro(s: GameState) {
  s.phase = "pro";
  s.crossroadsPending = false;
  s.atpPool = buildAtpPool();
  pushLog(s, "You turn professional and enter the ITF Futures circuit.", "good");
}

/* --------------------------------- staff ---------------------------------- */

export function staffOffers() {
  return STAFF_CATALOG.flatMap((c) =>
    c.tiers.map((t) => ({ role: c.role, ...t, id: `${c.role}-${t.quality}` })),
  );
}

export function hireStaff(
  s: GameState,
  offer: { id: string; role: string; name: string; quality: number; weekly: number },
) {
  if (s.staff.some((x) => x.id === offer.id)) return "Already on staff.";
  if (offer.weekly > s.bank) return "Your family cannot afford this contract yet.";
  s.staff = s.staff.filter((x) => x.role !== offer.role);
  s.staff.push({ ...offer, role: offer.role as Staff["role"] } as never);
  pushLog(s, `Hired ${offer.name} as ${offer.role} ($${offer.weekly}/week).`, "good");
  return null;
}

export function fireStaff(s: GameState, id: string) {
  const st = s.staff.find((x) => x.id === id);
  s.staff = s.staff.filter((x) => x.id !== id);
  if (st) pushLog(s, `Released ${st.name} (${st.role}).`, "info");
}

/* -------------------------------- doubles --------------------------------- */

export function generatePartnerOffers(s: GameState) {
  s.partnerOffers = Array.from({ length: 4 }, () => ({
    name: randomName(),
    utr: r2(clamp(s.utr + rnd(-1.6, 1.4), 1, 16.5)),
    chemistry: Math.round(rnd(20, 55)),
    titles: 0,
  }));
}

export function acceptPartner(s: GameState, name: string) {
  const p = s.partnerOffers.find((x) => x.name === name);
  if (!p) return;
  s.partner = { ...p };
  s.partnerOffers = s.partnerOffers.filter((x) => x.name !== name);
  pushLog(s, `Paired up with ${p.name} (UTR ${p.utr.toFixed(2)}) for doubles.`, "good");
}

export function sponsorOffers(s: GameState) {
  const rank = s.phase === "pro" ? atpRank(s) : ontarioRank(s);
  return SPONSORS.map((deal, i) => ({
    ...deal,
    eligible:
      s.sponsorReputation >= deal.minReputation &&
      (s.utr >= [8, 10, 12, 14, 16][i]! || rank <= [10, 10, 200, 100, 50][i]!),
  }));
}
export function signSponsor(s: GameState, id: string) {
  const deal = sponsorOffers(s).find((x) => x.id === id && x.eligible);
  if (!deal) return;
  s.sponsor = deal;
  s.allowance = 0;
  pushLog(
    s,
    `Signed with ${deal.name} for $${deal.weekly.toLocaleString()}/week. Family allowance has ended.`,
    "good",
  );
}
export function setEquipment(s: GameState, racquet: string, tension: "Low" | "Medium" | "High") {
  if (RACQUETS.some((r) => r.name === racquet)) s.racquet = racquet;
  s.stringTension = tension;
}
export function setRedshirt(s: GameState) {
  if (s.phase !== "college" || s.college.redshirted) return;
  s.college.redshirted = true;
  s.college.redshirtThisSeason = true;
  pushLog(s, "Redshirt season declared — competition paused and eligibility preserved.", "info");
}

/* --------------------------------- create --------------------------------- */

export function createGame(name: string, hand: Hand, playstyle: Playstyle): GameState {
  const wealth: Wealth = (["Working Class", "Middle Class", "Affluent"] as Wealth[])[
    Math.floor(Math.random() * 3)
  ]!;
  const s: GameState = {
    ontarioPool: buildOntarioPool(),
    atpPool: [],
    name,
    hand,
    playstyle,
    wealth,
    allowance: WEALTH_ALLOWANCE[wealth],
    age: 4,
    week: 1,
    season: 1,
    phase: "junior",
    attrs: { tennis: 6, fitness: 8, mental: 10, study: 12 },
    utr: 1.0,
    gamesWon: 0,
    gamesLost: 0,
    rogers: [],
    atp: [],
    selection: {},
    bank: 0,
    careerPrize: 0,
    gpa: 3.0,
    fatigue: 0,
    staff: [],
    partner: null,
    partnerOffers: [],
    trophies: [],
    log: [],
    runs: [],
    playedThisWeek: false,
    collegeDivision: null,
    collegeSuspended: false,
    qualifiedNationals: false,
    crossroadsPending: false,
    wins: 0,
    losses: 0,
    titles: 0,
    surfaceForm: { "Indoor Hard": 50, Hard: 50, Clay: 50, Grass: 50 },
    sponsor: null,
    sponsorReputation: 20,
    racquet: RACQUETS[2]!.name,
    stringTension: "Medium",
    history: [],
    yearReview: null,
    rivals: Array.from({ length: 5 }, () => ({
      name: randomName(),
      utr: r2(rnd(1, 1.8)),
      wins: 0,
      losses: 0,
      surfaces: {
        "Indoor Hard": { wins: 0, losses: 0 },
        Hard: { wins: 0, losses: 0 },
        Clay: { wins: 0, losses: 0 },
        Grass: { wins: 0, losses: 0 },
      },
    })),
    nationalTeam: { active: false, caps: 0, medals: 0, history: [], lastCallupSeason: 0 },
    college: {
      school: null,
      conference: null,
      seasonsUsed: 0,
      redshirted: false,
      redshirtThisSeason: false,
      teamWins: 0,
      teamLosses: 0,
      individualWins: 0,
      individualLosses: 0,
      conferenceChampion: false,
    },
  };
  pushLog(s, `${name} picks up a racquet for the first time in Ontario, Canada.`, "good");
  pushLog(s, `Family financial status: ${wealth} — $${s.allowance}/week available.`, "info");
  pushLog(
    s,
    `${hand}-handed ${playstyle}. Registered with the Ontario Tennis Association.`,
    "info",
  );
  return s;
}

type Staff = { role: "Private Coach" | "Fitness Trainer" | "Psychologist" };
