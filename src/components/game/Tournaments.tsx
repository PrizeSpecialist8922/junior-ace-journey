import { useMemo, useState } from "react";
import { commitEvent, listTournaments, playTournament, withdrawEvent } from "@/game/engine";
import type { BracketNode, GameState, Surface, TournamentRun } from "@/game/types";
import { ActionButton, Bar, Chip, Panel } from "./ui";
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

function BracketTree({ node, isRoot = true }: { node: BracketNode; isRoot?: boolean }) {
  return (
    <div className={cn("flex flex-col", isRoot ? "gap-4" : "gap-2")}>
      <div
        className={cn(
          "rounded-lg border px-3 py-2 text-xs",
          node.won === true
            ? "border-emerald-hi/40 bg-emerald-hi/10"
            : node.won === false
              ? "border-destructive/40 bg-destructive/10"
              : "border-border bg-secondary/50",
        )}
      >
        <p className="font-medium">{node.round || "Final"}</p>
        {node.opponent && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            vs {node.opponent}
            {node.oppUtr ? ` (${node.oppUtr.toFixed(2)})` : ""}
          </p>
        )}
        {node.score && (
          <p className={cn("mt-0.5 text-[11px] font-semibold", node.won ? "text-emerald-hi" : "text-destructive")}>
            {node.won ? "W" : "L"} {node.score}
          </p>
        )}
      </div>
      {node.children && (
        <div className="flex gap-4">
          {node.children.map((child, i) => (
            <BracketTree key={i} node={child} isRoot={false} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Tournaments({
  s,
  update,
}: {
  s: GameState;
  update: (fn: (d: GameState) => void) => void;
}) {
  const offers = useMemo(() => listTournaments(s), [s]);
  const [openRun, setOpenRun] = useState<TournamentRun | null>(s.runs[0] ?? null);
  const latest = s.runs[0] ?? null;
  const shown = openRun && s.runs.some((r) => r.id === openRun.id) ? openRun : latest;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
      <div className="space-y-5">
        <Panel title="Surface Form" subtitle="Familiarity rises with matches played; affects performance.">
          <div className="grid gap-3 sm:grid-cols-2">
            {SURFACES.map((sf) => (
                <div key={sf}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium">
                      {surfaceEmoji(sf)} {sf}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{Math.round(s.surfaceForm[sf])}/100</span>
                  </div>
                  <div className="mt-1.5">
                    <Bar value={s.surfaceForm[sf]} max={100} tone="emerald" />
                  </div>
                </div>
            ))}
          </div>
        </Panel>

        <Panel
          title={`Week ${s.week} Calendar`}
          subtitle="Commit before the entry deadline. Travel deposits are paid on commit."
          right={
            s.playedThisWeek ? (
              <Chip tone="gold">Already competed this week</Chip>
            ) : (
              <Chip tone="emerald">Entry open</Chip>
            )
          }
        >
          <ul className="space-y-2.5">
            {offers.map((o) => {
              const committed = s.committedEvents.includes(o.id);
              const deadlinePassed = s.week > o.deadlineWeek;
              return (
                <li
                  key={o.id}
                  className={cn(
                    "rounded-xl border p-3.5",
                    committed
                      ? "border-emerald-hi/40 bg-emerald-hi/8"
                      : o.eligible
                        ? "border-border bg-secondary/70"
                        : "border-border bg-secondary/30 opacity-70",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={cn("text-sm font-semibold", !o.eligible && !committed && "text-muted-foreground")}>
                          {o.name}
                        </p>
                        {committed && <Chip tone="emerald">Committed</Chip>}
                        {deadlinePassed && !committed && !o.eligible && <Chip tone="danger">Deadline passed</Chip>}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {o.venue.name} · {o.venue.city} · {o.surface} · Draw of {o.drawSize} · Field UTR ~
                        {o.fieldUtr.toFixed(2)}
                      </p>
                      <p className="mt-1.5 text-[11px]">
                        <span className="text-muted-foreground">Requirement: </span>
                        <span className={o.eligible || committed ? "text-emerald-hi" : "text-warn"}>
                          {o.requirement}
                        </span>
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Entry deadline: Week {o.deadlineWeek} · Travel deposit: ${o.travelCost}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {o.points > 0 ? <Chip tone="emerald">{o.points} pts to winner</Chip> : <Chip>No ranking points</Chip>}
                        {o.selectionPoints && <Chip tone="gold">Selection points</Chip>}
                        {o.prize > 0 && <Chip tone="gold">${o.prize.toLocaleString()} winner prize</Chip>}
                        {o.doubles && (
                          <Chip tone={s.partner ? "emerald" : "muted"}>
                            {s.partner ? `Doubles with ${s.partner.name}` : "Doubles — needs partner"}
                          </Chip>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {committed ? (
                        <>
                          <ActionButton
                            disabled={s.playedThisWeek}
                            onClick={() =>
                              update((d) => {
                                const run = playTournament(d, o);
                                setOpenRun(run);
                              })
                            }
                          >
                            Play
                          </ActionButton>
                          <ActionButton
                            variant="ghost"
                            disabled={s.playedThisWeek}
                            onClick={() => update((d) => withdrawEvent(d, o))}
                          >
                            Withdraw
                          </ActionButton>
                        </>
                      ) : (
                        <ActionButton
                          disabled={!o.eligible || deadlinePassed || s.playedThisWeek}
                          onClick={() => update((d) => commitEvent(d, o))}
                        >
                          Commit
                        </ActionButton>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel
          title="Draw & Results"
          subtitle={shown ? `${shown.name} — Age ${shown.age}, Week ${shown.week}` : undefined}
        >
          {!shown ? (
            <p className="text-xs text-muted-foreground">
              Enter a tournament to see your match-by-match draw.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone={shown.result === "CHAMPION" ? "gold" : "emerald"}>{shown.result}</Chip>
                {shown.points > 0 && <Chip>+{shown.points} ranking points</Chip>}
                {shown.prize > 0 && <Chip tone="gold">${shown.prize.toLocaleString()}</Chip>}
              </div>
              {shown.venue && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {shown.venue.name} · {shown.venue.city} · {shown.surface}
                  {shown.conditions && ` · ${shown.conditions.description}`}
                </p>
              )}
              <table className="mt-4 w-full text-xs">
                <thead>
                  <tr className="text-left text-[11px] text-muted-foreground">
                    <th className="pb-2 font-normal">Round</th>
                    <th className="pb-2 font-normal">Opponent</th>
                    <th className="pb-2 font-normal">UTR</th>
                    <th className="pb-2 font-normal">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.matches.map((m, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-2 pr-2 text-muted-foreground">{m.round}</td>
                      <td className="py-2 pr-2">{m.opponent}</td>
                      <td className="py-2 pr-2 tabular-nums text-muted-foreground">
                        {m.oppUtr.toFixed(2)}
                      </td>
                      <td
                        className={cn(
                          "py-2 tabular-nums font-medium",
                          m.won ? "text-emerald-hi" : "text-destructive",
                        )}
                      >
                        {m.won ? "W" : "L"} {m.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shown.bracket && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="stat-label mb-3">Bracket</p>
                  <div className="overflow-x-auto">
                    <BracketTree node={shown.bracket} />
                  </div>
                </div>
              )}
              {shown.doubles && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="stat-label">Doubles with {shown.doubles.partner}</p>
                  <p className="mt-1 text-xs text-emerald-hi">{shown.doubles.result}</p>
                  <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                    {shown.doubles.matches.map((m, i) => (
                      <li key={i}>
                        {m.round}: {m.won ? "W" : "L"} {m.score} vs {m.opponent}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </Panel>

        <Panel title="Recent Tournament History">
          {s.runs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No events played yet.</p>
          ) : (
            <ul className="scroll-thin max-h-72 space-y-1.5 overflow-y-auto pr-2">
              {s.runs.slice(0, 40).map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setOpenRun(r)}
                    className={cn(
                      "w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-secondary",
                      shown?.id === r.id && "bg-secondary",
                    )}
                  >
                    <span className="text-muted-foreground tabular-nums">
                      A{r.age}·W{r.week}
                    </span>{" "}
                    {r.name} —{" "}
                    <span className={r.result === "CHAMPION" ? "text-gold" : "text-emerald-hi"}>
                      {r.result}
                    </span>
                    {r.venue && <span className="ml-1 text-muted-foreground">· {r.venue.city}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
