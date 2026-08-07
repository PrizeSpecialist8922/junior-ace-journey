import { useState } from "react";
import { PLAYSTYLES, STYLE_BONUS } from "@/game/data";
import type { Hand, Playstyle } from "@/game/types";
import { ActionButton, Panel } from "./ui";
import { cn } from "@/lib/utils";

export function Creation({
  onStart,
}: {
  onStart: (name: string, hand: Hand, style: Playstyle) => void;
}) {
  const [name, setName] = useState("");
  const [hand, setHand] = useState<Hand>("Right");
  const [style, setStyle] = useState<Playstyle>("All-Court");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-14">
      <p className="stat-label">Ontario Tennis Association • Career Mode</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
        Age 4. <span className="text-emerald-hi">One racquet.</span> One career.
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Build a junior through the authentic five-tier OTA pathway, the ITF Junior circuit, NCAA
        college tennis and the professional tour. Country is locked to Canada, province locked to
        Ontario.
      </p>

      <Panel className="mt-8" title="Create your player">
        <label className="stat-label" htmlFor="pname">
          Player name
        </label>
        <input
          id="pname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Miles Carrington"
          className="mt-2 w-full rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-emerald-hi"
        />

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="stat-label">Handedness</p>
            <div className="mt-2 flex gap-2">
              {(["Left", "Right"] as Hand[]).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHand(h)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    hand === h
                      ? "border-emerald-hi bg-emerald-hi/12 text-emerald-hi"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {h}-handed
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="stat-label">Locked region</p>
            <div className="mt-2 flex gap-2 text-sm">
              <span className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-muted-foreground">
                Canada
              </span>
              <span className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-muted-foreground">
                Ontario
              </span>
            </div>
          </div>
        </div>

        <p className="stat-label mt-5">Playstyle</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {PLAYSTYLES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setStyle(p)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                style === p
                  ? "border-emerald-hi bg-emerald-hi/10"
                  : "border-border bg-secondary hover:border-muted-foreground",
              )}
            >
              <p className="text-sm font-semibold">{p}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {STYLE_BONUS[p]}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <ActionButton disabled={name.trim().length < 2} onClick={() => onStart(name.trim(), hand, style)}>
            Begin career at age 4
          </ActionButton>
          <p className="text-[11px] text-muted-foreground">
            Family financial status is randomly generated.
          </p>
        </div>
      </Panel>
    </div>
  );
}
