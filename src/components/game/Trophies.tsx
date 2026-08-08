import { absWeek, activePoints } from "@/game/engine";
import type { GameState } from "@/game/types";
import { Chip, Panel, Stat } from "./ui";

export function Trophies({ s }: { s: GameState }) {
  const groups: { key: string; label: string }[] = [
    { key: "OTA", label: "Ontario / OTA Hardware" },
    { key: "National", label: "National Bank Junior Nationals" },
    { key: "ITF", label: "ITF Junior Circuit" },
    { key: "College", label: "NCAA College" },
    { key: "Pro", label: "Professional Tour" },
    { key: "Milestone", label: "Career Milestones" },
    { key: "Team Canada", label: "National Team Medals" },
    { key: "Olympic", label: "Olympic Medals" },
  ];
  const now = absWeek(s);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Career Titles" value={s.titles} accent />
        <Stat
          label="Career Prize Money"
          value={`$${Math.round(s.careerPrize).toLocaleString()}`}
          sub="Singles + doubles earnings"
        />
        <Stat
          label="Peak UTR"
          value={s.utr.toFixed(2)}
          sub={`${s.gamesWon}-${s.gamesLost} games won/lost`}
        />
        <Stat
          label="Live Points"
          value={`${activePoints(s.rogers, now)} / ${activePoints(s.atp, now)}`}
          sub="Rogers / ATP (52-week rolling)"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {groups.map((g) => {
          const items = s.trophies.filter((t) => t.kind === g.key);
          return (
            <Panel key={g.key} title={g.label} subtitle={`${items.length} entries`}>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nothing earned yet.</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border bg-secondary px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold">{t.title}</p>
                        {t.detail && (
                          <p className="text-[11px] text-muted-foreground">{t.detail}</p>
                        )}
                      </div>
                      <Chip tone="gold">
                        Age {t.age} · S{t.season}
                      </Chip>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>

      <Panel title="Junior Record Archive" subtitle="Every event you have played, newest first.">
        {s.runs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No results recorded.</p>
        ) : (
          <div className="scroll-thin max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-[11px] text-muted-foreground">
                <tr>
                  <th className="pb-2 font-normal">Age/Week</th>
                  <th className="pb-2 font-normal">Event</th>
                  <th className="pb-2 font-normal">Tier</th>
                  <th className="pb-2 font-normal">Result</th>
                  <th className="pb-2 font-normal">Pts</th>
                  <th className="pb-2 font-normal">Prize</th>
                </tr>
              </thead>
              <tbody>
                {s.runs.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 pr-2 tabular-nums text-muted-foreground">
                      {r.age} · W{r.week}
                    </td>
                    <td className="py-2 pr-2">{r.name}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{r.tier}</td>
                    <td className="py-2 pr-2 text-emerald-hi">{r.result}</td>
                    <td className="py-2 pr-2 tabular-nums">{r.points}</td>
                    <td className="py-2 tabular-nums">
                      {r.prize ? `$${r.prize.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
