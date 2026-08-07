import {
  ITF_TIERS,
  NATIONALS_WEEK,
  PROVINCIALS_WEEK,
  PRO_TIERS,
  SELECTION_WEEKS,
  STAFF_CATALOG,
  SURFACES,
  WEALTH_ALLOWANCE,
  randomName,
} from "./data";
import type {
  AIPlayer,
  GameState,
  Hand,
  MatchResult,
  Playstyle,
  PointEntry,
  TournamentOffer,
  TournamentRun,
  Wealth,
} from "./types";

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const r2 = (v: number) => Math.round(v * 100) / 100;

export const absWeek = (s: { age: number; week: number }) => (s.age - 4) * 52 + s.week;

export function ageBracket(age: number) {
  if (age <= 11) return "U12";
  if (age <= 13) return "U14";
  if (age <= 15) return "U16";
  return "U18";
}

/* ---------------------------------- pools --------------------------------- */

function buildOntarioPool(): AIPlayer[] {
  return Array.from({ length: 300 }, (_, i) => ({
    name: randomName(),
    points: Math.round(3200 * Math.exp(-i / 55) + rnd(-40, 40) + 5),
    utr: r2(clamp(11.5 * Math.exp(-i / 90) + rnd(-0.4, 0.4) + 1.6, 1, 13)),
    selection: Math.round(Math.max(0, 900 * Math.exp(-i / 30) + rnd(-30, 30))),
  })).sort((a, b) => b.points - a.points);
}

function buildAtpPool(): AIPlayer[] {
  return Array.from({ length: 500 }, (_, i) => ({
    name: randomName(),
    points: Math.round(11000 * Math.exp(-i / 65) + rnd(-30, 30) + 4),
    utr: r2(clamp(16.3 - Math.log(i + 1) * 1.05 + rnd(-0.25, 0.25), 9.5, 16.5)),
  })).sort((a, b) => b.points - a.points);
}

function evolvePool(pool: AIPlayer[]) {
  for (const p of pool) {
    p.points = Math.max(1, Math.round(p.points * 0.985 + rnd(-6, 26)));
  }
  pool.sort((a, b) => b.points - a.points);
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

function styleEdge(style: Playstyle, oppUtr: number, myUtr: number, surface: string) {
  let e = 0;
  if (style === "Serve & Volley" && surface.includes("Hard")) e += 0.3;
  if (style === "Serve & Volley" && surface === "Grass") e += 0.45;
  if (style === "Baseline Grinder" && surface === "Clay") e += 0.4;
  if (style === "Counterpuncher" && oppUtr > myUtr) e += 0.45;
  if (style === "All-Court") e += 0.12;
  return e;
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
  surface: string,
): MatchResult {
  const fatiguePenalty = (s.fatigue / 100) * 1.2;
  const mentalBonus = (s.attrs.mental / 100) * 0.5;
  const eff =
    s.utr - fatiguePenalty + mentalBonus + styleEdge(s.playstyle, oppUtr, s.utr, surface);
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
  s.utr = r2(clamp(s.utr + 0.42 * (actual - expected) * weight, 1, 16.5));
  s.gamesWon += gw;
  s.gamesLost += gl;
  s.fatigue = clamp(s.fatigue + 5 + sets.length * 2, 0, 100);
  if (won) s.wins++;
  else s.losses++;

  return {
    round,
    opponent: oppName,
    oppUtr: r2(oppUtr),
    score: sets.map((x) => `${x[0]}-${x[1]}`).join(", "),
    won,
  };
}

/* ----------------------------- tournament list ---------------------------- */

function surfaceForWeek(week: number) {
  if (week <= 14 || week >= 44) return "Indoor Hard";
  if (week <= 24) return "Clay";
  if (week <= 30) return "Grass";
  return "Hard";
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

export function listTournaments(s: GameState): TournamentOffer[] {
  const out: TournamentOffer[] = [];
  const surface = surfaceForWeek(s.week);
  const u = tierUnlocks(s);
  const br = ageBracket(s.age);

  if (s.phase === "pro") {
    const rank = atpRank(s);
    PRO_TIERS.forEach((t, i) => {
      out.push({
        id: `pro-${i}`,
        name: `${t.name} — Week ${s.week}`,
        tier: t.name,
        level: 6,
        requirement:
          t.name === "Grand Slam"
            ? "Direct acceptance: ATP Top 104"
            : `ATP rank ${t.rank} or better`,
        eligible: rank <= t.rank,
        drawSize: t.drawSize,
        fieldUtr: t.utr,
        points: t.points,
        prize: t.prize,
        selectionPoints: false,
        doubles: true,
        surface,
      });
    });
    return out;
  }

  if (s.phase === "college") {
    out.push({
      id: "college-dual",
      name: `NCAA ${s.collegeDivision} Dual Match`,
      tier: `NCAA ${s.collegeDivision}`,
      level: 5.5,
      requirement: s.collegeSuspended ? "Suspended — GPA below 2.0" : "Roster member in good standing",
      eligible: !s.collegeSuspended,
      drawSize: 4,
      fieldUtr:
        s.collegeDivision === "D1" ? 13.2 : s.collegeDivision === "D2" ? 11.0 : 8.0,
      points: 0,
      prize: 0,
      selectionPoints: false,
      doubles: true,
      surface,
    });
    ITF_TIERS.slice(0, 3).forEach((t, i) => {
      out.push({
        id: `sum-itf-${i}`,
        name: `Summer Open — ${t.name.replace("J", "$")}`,
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
        surface,
      });
    });
    return out;
  }

  if (s.age < 10) {
    out.push({
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
    });
    return out;
  }

  out.push({
    id: "l1",
    name: `Rogers First Set Tour ${br} — Rookie Round Robin`,
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
  });
  out.push({
    id: "l2",
    name: `Nike Transition Tour ${br} — ${surface}`,
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
  });
  out.push({
    id: "l3",
    name: `Provincial Circuit ${br} — ${surface}`,
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
  });
  out.push({
    id: "l35",
    name: `Provincial Circuit + ${br} — ${surface}`,
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
  });

  if (SELECTION_WEEKS.includes(s.week)) {
    const indoor = s.week < 20 || s.week > 40;
    out.push({
      id: "l4",
      name: `OTA Selection Series ${br} — ${indoor ? "Indoor (Winter)" : "Outdoor (Summer)"}`,
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
      surface: indoor ? "Indoor Hard" : "Hard",
    });
  }
  if (s.week === PROVINCIALS_WEEK) {
    out.push({
      id: "provincials",
      name: `Ontario Provincial Championships ${br}`,
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
    });
  }
  if (s.week === NATIONALS_WEEK) {
    out.push({
      id: "nationals",
      name: `National Bank Junior Nationals ${br}`,
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
    });
  }

  if (u.itf) {
    ITF_TIERS.forEach((t, i) => {
      out.push({
        id: `itf-${i}`,
        name: `${t.name} ${["Toronto", "Montreal", "Miami", "Barcelona", "Osaka"][i]}`,
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
        surface: SURFACES[i % SURFACES.length]!,
      });
    });
  }
  return out;
}

/* --------------------------- tournament execution ------------------------- */

const RESULT_SHARE: Record<string, number> = {
  W: 1,
  F: 0.6,
  SF: 0.36,
  QF: 0.2,
  R16: 0.1,
  R32: 0.045,
  R64: 0.02,
  RR: 0,
};

function roundNames(drawSize: number) {
  const names: string[] = [];
  let n = drawSize;
  while (n > 1) {
    names.push(n === 2 ? "Final" : n === 4 ? "Semifinal" : n === 8 ? "Quarterfinal" : `Round of ${n}`);
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

export function playTournament(s: GameState, offer: TournamentOffer): TournamentRun {
  const matches: MatchResult[] = [];
  const log = (t: string, tone = "info") => pushLog(s, t, tone);

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
      });
    }
  } else {
    const names = roundNames(offer.drawSize);
    let roundsWon = 0;
    for (let i = 0; i < names.length; i++) {
      const step = i / Math.max(1, names.length - 1);
      const oppUtr = clamp(offer.fieldUtr - 1.0 + step * 2.6 + rnd(-0.4, 0.4), 1, 16.5);
      const m = simulateMatch(s, names[i]!, randomName(), oppUtr, offer.surface);
      matches.push(m);
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
    earned = Math.round(offer.points * share);
    prize = Math.round(offer.prize * (share === 1 ? 1 : share * 0.9));

    if (code === "W") {
      s.titles++;
      s.trophies.push({
        title: offer.name,
        kind:
          offer.id === "nationals"
            ? "National"
            : offer.level === 5
              ? "ITF"
              : offer.level === 6
                ? "Pro"
                : "OTA",
        age: s.age,
        season: s.season,
        detail: `${offer.tier} • ${offer.surface}`,
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
  };

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
        detail: `with ${s.partner.name}`,
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

export function nextWeek(
  s: GameState,
  alloc: { tennis: number; fitness: number; study: number },
) {
  const now = absWeek(s);
  s.rogers = pruneExpired(s.rogers, now);
  s.atp = pruneExpired(s.atp, now);

  // income & expenses
  if (s.age <= 18) s.bank += s.allowance;
  const cost = weeklyStaffCost(s);
  s.bank -= cost;
  if (s.bank < 0) {
    const dropped = s.staff.pop();
    if (dropped) {
      s.bank += dropped.weekly;
      pushLog(s, `Could not afford ${dropped.name} (${dropped.role}) — contract terminated.`, "bad");
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
  s.attrs.tennis = clamp(s.attrs.tennis + alloc.tennis * 0.075 * cm * tired * youth * dim(s.attrs.tennis), 0, 100);
  s.attrs.fitness = clamp(s.attrs.fitness + alloc.fitness * 0.08 * fm * tired * youth * dim(s.attrs.fitness), 0, 100);
  s.attrs.mental = clamp(s.attrs.mental + (alloc.study * 0.03 + 0.05) * pm * dim(s.attrs.mental), 0, 100);
  s.attrs.study = clamp(s.attrs.study + alloc.study * 0.12 * dim(s.attrs.study), 0, 100);
  // UTR ceiling from raw ability: training alone cannot make you a tour player
  const ceiling = 1 + (s.attrs.tennis * 0.09 + s.attrs.fitness * 0.035 + s.attrs.mental * 0.025);
  const headroom = Math.max(0, ceiling - s.utr);
  s.utr = r2(
    clamp(s.utr + Math.min(headroom, alloc.tennis * 0.0045 * cm + alloc.fitness * 0.0015 * fm), 1, 16.5),
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
    s.utr = r2(clamp(s.utr + 0.012, 1, 16.5));
  }

  evolvePool(s.ontarioPool);
  if (s.phase === "pro") evolvePool(s.atpPool);

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
    s.week = 1;
    s.age++;
    s.season++;
    s.selection = {};
    s.qualifiedNationals = false;
    pushLog(s, `— Season ${s.season} begins. You are now ${s.age} years old. —`, "good");
    if (s.age === 10)
      pushLog(s, "OTA sanctioned tournaments unlocked: you may now enter the Rogers First Set Tour.", "good");
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

export function chooseCollege(s: GameState, div: string) {
  s.phase = "college";
  s.collegeDivision = div;
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
  };
  pushLog(s, `${name} picks up a racquet for the first time in Ontario, Canada.`, "good");
  pushLog(s, `Family financial status: ${wealth} — $${s.allowance}/week available.`, "info");
  pushLog(s, `${hand}-handed ${playstyle}. Registered with the Ontario Tennis Association.`, "info");
  return s;
}

type Staff = { role: "Private Coach" | "Fitness Trainer" | "Psychologist" };
