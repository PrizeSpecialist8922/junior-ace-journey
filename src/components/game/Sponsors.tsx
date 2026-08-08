import { RACQUETS } from "@/game/data";
import { setEquipment, signSponsor, sponsorOffers } from "@/game/engine";
import type { GameState } from "@/game/types";
import { ActionButton, Chip, Panel, Stat } from "./ui";

export function Sponsors({
  s,
  update,
}: {
  s: GameState;
  update: (fn: (d: GameState) => void) => void;
}) {
  const offers = sponsorOffers(s);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Current Sponsor"
          value={s.sponsor?.name ?? "Unsigned"}
          sub={
            s.sponsor
              ? `$${s.sponsor.weekly.toLocaleString()} weekly`
              : "Build reputation to unlock deals"
          }
        />
        <Stat
          label="Sponsor Reputation"
          value={`${Math.round(s.sponsorReputation)}/100`}
          accent
          sub="Wins and titles raise your profile"
        />
        <Stat label="Equipment" value={s.racquet} sub={`${s.stringTension} string tension`} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Endorsement Market" subtitle="Milestone and reputation-gated weekly income.">
          <div className="space-y-2">
            {offers.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{o.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {o.requirement} · Reputation {o.minReputation}+ · ${o.weekly.toLocaleString()}
                    /week
                  </p>
                </div>
                <ActionButton
                  disabled={!o.eligible || s.sponsor?.id === o.id}
                  onClick={() => update((d) => signSponsor(d, o.id))}
                >
                  {s.sponsor?.id === o.id ? "Signed" : "Sign"}
                </ActionButton>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Equipment Lab"
          subtitle="Choose a frame and tension; bonuses are intentionally small."
        >
          <div className="space-y-2">
            {RACQUETS.map((r) => (
              <button
                key={r.name}
                onClick={() => update((d) => setEquipment(d, r.name, d.stringTension))}
                className={`w-full rounded-lg border p-3 text-left ${s.racquet === r.name ? "border-emerald-hi bg-emerald-hi/10" : "border-border bg-secondary"}`}
              >
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-[11px] text-muted-foreground">{r.bonus}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            {(["Low", "Medium", "High"] as const).map((t) => (
              <ActionButton
                key={t}
                variant={s.stringTension === t ? "solid" : "ghost"}
                onClick={() => update((d) => setEquipment(d, d.racquet, t))}
              >
                {t}
              </ActionButton>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Low adds power; High adds control; Medium stays balanced.
          </p>
        </Panel>
      </div>
    </div>
  );
}
