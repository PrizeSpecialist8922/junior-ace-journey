import { useMemo, useState } from "react";
import { listTournaments, playTournament } from "@/game/engine";
import type { GameState, TournamentRun } from "@/game/types";
import { ActionButton, Chip, Panel } from "./ui";
import { cn } from "@/lib/utils";

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
      <Panel
        title={`Week ${s.week} Calendar`}
        subtitle="Only events matching your eligibility can be entered."
        right={
          s.playedThisWeek ? (
            <Chip tone="gold">Already competed this week</Chip>
          ) : (
            <Chip tone="emerald">Entry open</Chip>
          )
        }
      >
        <ul className="space-y-2.5">
          {offers.map((o) => (
            <li
              key={o.id}
              className={cn(
                "rounded-xl border p-3.5",
                o.eligible ? "border-border bg-secondary/70" : "border-border bg-secondary/30",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={cn("text-sm font-semibold", !o.eligible && "text-muted-foreground")}>
                    {o.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {o.tier} · {o.surface} · Draw of {o.drawSize} · Field UTR ~
                    {o.fieldUtr.toFixed(2)}
                  </p>
                  <p className="mt-1.5 text-[11px]">
                    <span className="text-muted-foreground">Requirement: </span>
                    <span className={o.eligible ? "text-emerald-hi" : "text-warn"}>
                      {o.requirement}
                    </span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {o.points > 0 ? (
                      <Chip tone="emerald">{o.points} pts to winner</Chip>
                    ) : (
                      <Chip>No ranking points</Chip>
                    )}
                    {o.selectionPoints && <Chip tone="gold">Selection points</Chip>}
                    {o.prize > 0 && <Chip tone="gold">${o.prize.toLocaleString()} winner prize</Chip>}
                    {o.doubles && (
                      <Chip tone={s.partner ? "emerald" : "muted"}>
                        {s.partner ? `Doubles with ${s.partner.name}` : "Doubles — needs partner"}
                      </Chip>
                    )}
                  </div>
                </div>
                <ActionButton
                  disabled={!o.eligible || s.playedThisWeek}
                  onClick={() =>
                    update((d) => {
                      const run = playTournament(d, o);
                      setOpenRun(run);
                    })
                  }
                >
                  Enter
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

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
