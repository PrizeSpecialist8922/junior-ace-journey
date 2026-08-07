import { acceptPartner, generatePartnerOffers, tierUnlocks } from "@/game/engine";
import type { GameState } from "@/game/types";
import { ActionButton, Bar, Chip, Panel } from "./ui";

export function Doubles({
  s,
  update,
}: {
  s: GameState;
  update: (fn: (d: GameState) => void) => void;
}) {
  const unlocked = tierUnlocks(s).l35 || s.phase !== "junior";

  if (!unlocked) {
    return (
      <Panel title="Doubles Locked" subtitle="Doubles is officially unlocked at Level 3.5 — Provincial Circuit Plus (+).">
        <p className="text-xs text-muted-foreground">
          Reach a Top 50 Ontario ranking or a UTR above 6.00 to scout partners and enter doubles
          brackets. Current UTR: <span className="text-foreground">{s.utr.toFixed(2)}</span>.
        </p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Current Partner" subtitle="Chemistry grows with every match you play together.">
        {!s.partner ? (
          <p className="text-xs text-muted-foreground">
            No partner signed. Scout Ontario players on the right to form a team.
          </p>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-semibold">{s.partner.name}</p>
                <p className="text-[11px] text-muted-foreground">Ontario, Canada</p>
              </div>
              <Chip tone="emerald">UTR {s.partner.utr.toFixed(2)}</Chip>
            </div>
            <div className="mt-4 space-y-3">
              <Bar label="Chemistry" value={s.partner.chemistry} />
              <Bar
                label="Combined team rating"
                value={((s.utr + s.partner.utr) / 2 / 16.5) * 100}
              />
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Doubles titles together:{" "}
              <span className="text-foreground">{s.partner.titles}</span>
            </p>
            <ActionButton
              className="mt-4"
              variant="danger"
              onClick={() => update((d) => (d.partner = null))}
            >
              End partnership
            </ActionButton>
          </>
        )}
      </Panel>

      <Panel
        title="Scout Partners"
        subtitle="Invite an AI player from the province to your doubles team."
        right={
          <ActionButton variant="ghost" onClick={() => update((d) => generatePartnerOffers(d))}>
            Scout province
          </ActionButton>
        }
      >
        {s.partnerOffers.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No scouting reports yet — run a scouting sweep.
          </p>
        ) : (
          <ul className="space-y-2">
            {s.partnerOffers.map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    UTR {p.utr.toFixed(2)} · Starting chemistry {p.chemistry}
                  </p>
                </div>
                <ActionButton onClick={() => update((d) => acceptPartner(d, p.name))}>
                  Invite
                </ActionButton>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
