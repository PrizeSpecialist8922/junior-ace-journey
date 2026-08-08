import {
  absWeek,
  activePoints,
  ageBracket,
  atpRank,
  chooseCollege,
  collegeOptions,
  goPro,
  ontarioRank,
  selectionRank,
  tierUnlocks,
  weeklyStaffCost,
} from "@/game/engine";
import { OTA_LEVELS } from "@/game/data";
import type { GameState, Surface } from "@/game/types";
import { ActionButton, Bar, Chip, Panel, Stat } from "./ui";
import { cn } from "@/lib/utils";

const SURFACES: Surface[] = ["Indoor Hard", "Hard", "Clay", "Grass"];

function surfaceEmoji(surface: Surface) {
  switch (surface) {
    case "Indoor Hard":
      return "🏢";
    case "Hard":
      return "🧱";
    case "Clay":
      return "🟠";
    case "Grass":
      return "🌿";
  }
}

export function Dashboard({
  s,
  update,
}: {
  s: GameState;
  update: (fn: (d: GameState) => void) => void;
}) {
  const now = absWeek(s);
  const rogers = activePoints(s.rogers, now);
  const atp = activePoints(s.atp, now);
  const rank = ontarioRank(s);
  const u = tierUnlocks(s);
  const bracket = ageBracket(s.age);
  const selPts = s.selection[bracket] ?? 0;
  const selRank = selectionRank(s);

  const tierLabel =
    s.phase === "pro"
      ? "Professional Tour"
      : s.phase === "college"
        ? `NCAA ${s.collegeDivision}`
        : s.phase === "retired"
          ? "Retired"
          : s.age < 10
            ? "Progressive Tennis (Ages 4-9)"
            : u.l4
              ? "Level 4.0 — Selection Series"
              : u.l35
                ? "Level 3.5 — Provincial Circuit +"
                : u.l3
                  ? "Level 3 — Provincial Circuit"
                  : u.l2
                    ? "Level 2 — Nike Transition Tour"
                    : "Level 1 — Rookie Tour";

  return (
    <div className="space-y-5">
      {s.crossroadsPending && (
        <Panel
          title="Age 18 Crossroads"
          subtitle={`Your UTR is ${s.utr.toFixed(2)}. Scholarships are gated strictly by UTR.`}
          className="border-emerald-hi/40"
        >
          <div className="grid gap-3 sm:grid-cols-4">
            {collegeOptions(s.utr).map((c) => (
              <div key={c.div} className="rounded-lg border border-border bg-secondary p-3">
                <p className="text-sm font-semibold">NCAA {c.div}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{c.range}</p>
                <ActionButton
                  className="mt-3 w-full"
                  variant={c.ok ? "solid" : "ghost"}
                  disabled={!c.ok}
                  onClick={() => update((d) => chooseCollege(d, c.div))}
                >
                  {c.ok ? "Accept" : "Not eligible"}
                </ActionButton>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-secondary p-3">
              <p className="text-sm font-semibold">Turn Professional</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Start on the ITF Futures ladder immediately.
              </p>
              <ActionButton className="mt-3 w-full" onClick={() => update((d) => goPro(d))}>
                Go Pro
              </ActionButton>
            </div>
          </div>
        </Panel>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Age" value={s.age} sub={`Week ${s.week} of 52 • Season ${s.season}`} />
        <Stat label="Global UTR" value={s.utr.toFixed(2)} accent sub="Scale 1.00 – 16.50" />
        <Stat
          label="Rogers Ranking Points"
          value={rogers.toLocaleString()}
          sub={rank === 999 ? "Unranked in Ontario" : `#${rank} in Ontario`}
        />
        <Stat
          label={s.phase === "pro" ? "ATP Points" : "ATP Points (locked)"}
          value={atp.toLocaleString()}
          sub={s.phase === "pro" ? `ATP Rank #${atpRank(s)}` : "Turn pro to enter the ranking"}
        />
        <Stat label="Bank Balance" value={`$${Math.round(s.bank).toLocaleString()}`} sub={`${s.wealth} • $${s.allowance}/wk allowance`} />
        <Stat
          label="Active Tier"
          value={<span className="text-base">{tierLabel}</span>}
          sub={`${s.hand}-handed ${s.playstyle}`}
        />
        <Stat
          label="GPA"
          value={s.phase === "college" ? s.gpa.toFixed(2) : "—"}
          sub={
            s.phase === "college"
              ? s.collegeSuspended
                ? "SUSPENDED — below 2.00"
                : "Eligible to play"
              : "College only"
          }
        />
        <Stat
          label="Career Record"
          value={`${s.wins}-${s.losses}`}
          sub={`${s.titles} titles • $${Math.round(s.careerPrize).toLocaleString()} prize money`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Condition & Attributes" className="lg:col-span-1">
          <div className="space-y-3">
            <Bar label="Fatigue" value={s.fatigue} tone={s.fatigue > 65 ? "warn" : "emerald"} />
            <Bar label="Tennis Skill" value={s.attrs.tennis} />
            <Bar label="Fitness" value={s.attrs.fitness} />
            <Bar label="Mental" value={s.attrs.mental} />
            <Bar label="Academics" value={s.attrs.study} tone="muted" />
          </div>
          <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <p>
              Games won / lost:{" "}
              <span className="text-foreground tabular-nums">
                {s.gamesWon} / {s.gamesLost}
              </span>
            </p>
            <p>
              Weekly staff cost:{" "}
              <span className="text-foreground tabular-nums">
                ${weeklyStaffCost(s).toLocaleString()}
              </span>
            </p>
          </div>
        </Panel>

        <Panel
          title={`Selection Points Race — ${bracket}`}
          subtitle="Top 16 in Ontario qualify directly into the National Bank Junior Nationals Main Draw."
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="font-display text-3xl font-semibold text-emerald-hi tabular-nums">
                {selPts}
              </p>
              <p className="stat-label mt-1">Cycle points</p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-semibold tabular-nums">
                {selRank === 999 ? "—" : `#${selRank}`}
              </p>
              <p className="stat-label mt-1">Ontario position</p>
            </div>
          </div>
          <div className="mt-4">
            <Bar value={Math.min(selRank === 999 ? 0 : 17 - Math.min(selRank, 17), 16)} max={16} />
            <p className="mt-2 text-[11px] text-muted-foreground">
              4 Selection Series events (2 indoor, 2 outdoor) + Ontario Provincial Championships feed
              this race.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {(["U12", "U14", "U16", "U18"] as const).map((b) => (
              <div
                key={b}
                className={cn(
                  "rounded-lg border p-2 text-center",
                  b === bracket ? "border-emerald-hi/50 bg-emerald-hi/10" : "border-border bg-secondary",
                )}
              >
                <p className="text-[11px] text-muted-foreground">{b}</p>
                <p className="text-sm font-semibold tabular-nums">{s.selection[b] ?? 0}</p>
              </div>
            ))}
          </div>
          {s.qualifiedNationals && (
            <p className="mt-3">
              <Chip tone="gold">Qualified — Junior Nationals Main Draw</Chip>
            </p>
          )}
        </Panel>

        <Panel title="OTA Pathway Gates" subtitle="Unlocks recalculate every week.">
          <ul className="space-y-2">
            {OTA_LEVELS.map((l) => {
              const open =
                l.level === 1
                  ? u.l1
                  : l.level === 2
                    ? u.l2
                    : l.level === 3
                      ? u.l3
                      : l.level === 3.5
                        ? u.l35
                        : u.l4;
              return (
                <li
                  key={l.level}
                  className="rounded-lg border border-border bg-secondary/60 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">
                      L{l.level} — {l.name.split("—").pop()?.trim()}
                    </p>
                    <Chip tone={open ? "emerald" : "muted"}>{open ? "Open" : "Locked"}</Chip>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{l.gate}</p>
                </li>
              );
            })}
            <li className="rounded-lg border border-border bg-secondary/60 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold">ITF Junior Circuit</p>
                <Chip tone={u.itf ? "emerald" : "muted"}>{u.itf ? "Open" : "Age 13+"}</Chip>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Strictly locked until you turn exactly 13 years old.
              </p>
            </li>
          </ul>
        </Panel>
      </div>

      <Panel title="Live Career Feed" subtitle="Most recent events first.">
        <ul className="scroll-thin max-h-[22rem] space-y-1.5 overflow-y-auto pr-2">
          {s.log.map((l, i) => (
            <li key={i} className="flex gap-3 rounded-lg px-2 py-1.5 text-xs hover:bg-secondary/60">
              <span className="w-24 shrink-0 tabular-nums text-muted-foreground">
                Age {l.age} · W{l.week}
              </span>
              <span
                className={cn(
                  l.tone === "good" && "text-emerald-hi",
                  l.tone === "bad" && "text-destructive",
                )}
              >
                {l.text}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
