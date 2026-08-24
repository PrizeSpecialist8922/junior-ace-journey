import { useState } from "react";
import {
  BODY_AREAS,
  fireStaff,
  hireStaff,
  injuryRisk,
  isSidelined,
  nextWeek,
  physioQuality,
  staffMultiplier,
  staffOffers,
  weeklyStaffCost,
} from "@/game/engine";
import type { GameState } from "@/game/types";
import { ActionButton, Bar, Chip, Panel } from "./ui";
import { cn } from "@/lib/utils";

const ROLES = [
  "Private Coach",
  "Fitness Trainer",
  "Psychologist",
  "Physiotherapist",
] as const;

export function Training({
  s,
  update,
}: {
  s: GameState;
  update: (fn: (d: GameState) => void) => void;
}) {
  const [tennis, setTennis] = useState(4);
  const [fitness, setFitness] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const study = Math.max(0, 10 - tennis - fitness);
  const offers = staffOffers();
  const risk = injuryRisk(s);
  const sidelined = isSidelined(s);

  const setT = (v: number) => {
    setTennis(v);
    if (v + fitness > 10) setFitness(10 - v);
  };
  const setF = (v: number) => {
    setFitness(v);
    if (v + tennis > 10) setTennis(10 - v);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-5">
        <Panel
          title="Weekly Training Allocation"
          subtitle="Distribute 10 points each week, then simulate."
        >
          <div className="space-y-5">
            {[
              { label: "Tennis Skills", value: tennis, set: setT, mult: staffMultiplier(s, "Private Coach") },
              { label: "Fitness", value: fitness, set: setF, mult: staffMultiplier(s, "Fitness Trainer") },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{row.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {row.value} pts · ×{row.mult.toFixed(2)} staff multiplier
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={row.value}
                  onChange={(e) => row.set(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--emerald)]"
                />
              </div>
            ))}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Studying (auto-remainder)</span>
                <span className="tabular-nums text-muted-foreground">{study} pts</span>
              </div>
              <div className="mt-2">
                <Bar value={study} max={10} tone="muted" />
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
            <div className="text-[11px] text-muted-foreground">
              <p>
                Weekly income: <span className="text-foreground">${s.allowance}</span> · Staff cost:{" "}
                <span className="text-foreground">${weeklyStaffCost(s).toLocaleString()}</span>
              </p>
              <p>Fatigue rises with training and matches; rest weeks recover it.</p>
            </div>
            <ActionButton
              onClick={() => update((d) => nextWeek(d, { tennis, fitness, study }))}
              disabled={s.phase === "retired"}
            >
              Next Week →
            </ActionButton>
          </div>
        </Panel>

        <Panel
          title="Load & Health"
          subtitle="Matches and heavy training load the body. Rest and a physio bring it down."
          right={
            <Chip tone={risk > 55 ? "bad" : risk > 30 ? "gold" : "emerald"}>
              Injury risk {risk}%
            </Chip>
          }
        >
          {s.injury ? (
            <div
              className={cn(
                "mb-4 rounded-lg border p-3",
                sidelined ? "border-destructive/50 bg-destructive/10" : "border-warn/50 bg-warn/10",
              )}
            >
              <p className="text-sm font-semibold">
                {s.injury.severity}: {s.injury.label} ({s.injury.area})
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {sidelined
                  ? `Out of competition for ${s.injury.weeksOut} more week(s) of a ${s.injury.weeksTotal}-week layoff. Simulate weeks to rehab.`
                  : "You can compete, but you will play below your level until it settles."}
              </p>
            </div>
          ) : (
            <p className="mb-4 text-[11px] text-emerald-hi">No current injury — body is holding up.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {BODY_AREAS.map((area) => {
              const v = s.bodyLoad?.[area] ?? 0;
              return (
                <div key={area}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium">{area}</span>
                    <span className="tabular-nums text-muted-foreground">{Math.round(v)}/100</span>
                  </div>
                  <div className="mt-1.5">
                    <Bar value={v} max={100} tone={v > 70 ? "warn" : "emerald"} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid gap-2 border-t border-border pt-3 sm:grid-cols-3">
            <div>
              <p className="stat-label">Match sharpness</p>
              <p className="text-sm font-semibold tabular-nums">{Math.round(s.sharpness ?? 100)}%</p>
            </div>
            <div>
              <p className="stat-label">Confidence</p>
              <p className="text-sm font-semibold tabular-nums">{Math.round(s.confidence ?? 50)}</p>
            </div>
            <div>
              <p className="stat-label">Motivation</p>
              <p
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  (s.motivation ?? 80) < 25 && "text-destructive",
                )}
              >
                {Math.round(s.motivation ?? 80)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-[11px] text-muted-foreground">
              Physio quality {physioQuality(s)}/4 — speeds recovery and drains load faster. A rest
              week (2 or fewer points into tennis and fitness, no tournament) restores motivation.
            </p>
            <ActionButton
              variant="ghost"
              onClick={() => update((d) => nextWeek(d, { tennis: 1, fitness: 1, study: 8 }))}
              disabled={s.phase === "retired"}
            >
              Rest Week
            </ActionButton>
          </div>
        </Panel>

        {s.injuryHistory && s.injuryHistory.length > 0 && (
          <Panel title="Injury History">
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              {s.injuryHistory.slice(0, 8).map((h, i) => (
                <li key={i}>
                  Age {h.age}: {h.label} ({h.area}) — {h.weeks} week(s)
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Panel title="Backroom Staff" subtitle="One contract per role. Paid weekly from your bank.">
          {s.staff.length === 0 ? (
            <p className="text-xs text-muted-foreground">No staff hired yet.</p>
          ) : (
            <ul className="space-y-2">
              {s.staff.map((st) => (
                <li
                  key={st.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold">{st.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {st.role} · Quality {st.quality}/5 · ${st.weekly}/week
                    </p>
                  </div>
                  <ActionButton variant="danger" onClick={() => update((d) => fireStaff(d, st.id))}>
                    Release
                  </ActionButton>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title="Staff Market"
        subtitle="What your family can afford depends on your financial status and prize money."
        right={<Chip tone="emerald">${Math.round(s.bank).toLocaleString()} available</Chip>}
      >
        {error && <p className="mb-3 text-xs text-destructive">{error}</p>}
        <div className="space-y-5">
          {ROLES.map((role) => (
            <div key={role}>
              <p className="stat-label">{role}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {offers
                  .filter((o) => o.role === role)
                  .map((o) => {
                    const hired = s.staff.some((x) => x.id === o.id);
                    const afford = o.weekly <= s.bank;
                    return (
                      <div
                        key={o.id}
                        className={cn(
                          "rounded-lg border p-3",
                          hired
                            ? "border-emerald-hi/50 bg-emerald-hi/10"
                            : afford
                              ? "border-border bg-secondary"
                              : "border-border bg-secondary/40 opacity-60",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{o.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              Quality {o.quality} · ${o.weekly}/week
                            </p>
                          </div>
                          <span className="text-[11px] text-emerald-hi">
                            ×{(1 + o.quality * 0.22).toFixed(2)}
                          </span>
                        </div>
                        <ActionButton
                          className="mt-3 w-full"
                          variant={hired ? "ghost" : "solid"}
                          disabled={hired || !afford}
                          onClick={() =>
                            update((d) => {
                              const err = hireStaff(d, o);
                              setError(err);
                            })
                          }
                        >
                          {hired ? "On staff" : afford ? "Hire" : "Cannot afford"}
                        </ActionButton>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
