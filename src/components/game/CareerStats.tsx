import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GameState } from "@/game/types";
import { Chip, Panel, Stat } from "./ui";

export function CareerStats({ s }: { s: GameState }) {
  const rivals = [...s.rivals].sort((a, b) => b.wins + b.losses - a.wins - a.losses);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Seasons Recorded" value={s.history.length} />
        <Stat label="Recurring Rivals" value={s.rivals.length} />
        <Stat
          label="Total Meetings"
          value={rivals.reduce((n, r) => n + r.wins + r.losses, 0)}
          accent
        />
      </div>
      <Panel title="Career Progression" subtitle="End-of-season UTR and ranking snapshots.">
        <div className="h-80">
          {s.history.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={s.history}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="season" />
                <YAxis yAxisId="rank" reversed />
                <YAxis yAxisId="utr" orientation="right" domain={[0, 17]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="utr" dataKey="utr" stroke="#34d399" name="UTR" />
                <Line yAxisId="rank" dataKey="rogersRank" stroke="#fbbf24" name="Rogers rank" />
                <Line yAxisId="rank" dataKey="atpRank" stroke="#60a5fa" name="ATP rank" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground">
              Complete a season to create the first snapshot.
            </p>
          )}
        </div>
      </Panel>
      <Panel
        title="Rivals"
        subtitle="Persistent opponents grow alongside you; records include surface splits."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {rivals.map((r) => (
            <div key={r.name} className="rounded-lg border border-border bg-secondary p-3">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">{r.name}</p>
                <Chip tone="emerald">
                  {r.wins}-{r.losses}
                </Chip>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                UTR {r.utr.toFixed(2)} ·{" "}
                {Object.entries(r.surfaces)
                  .map(([sf, v]) => `${sf} ${v.wins}-${v.losses}`)
                  .join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
