import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Creation } from "@/components/game/Creation";
import { Dashboard } from "@/components/game/Dashboard";
import { Doubles } from "@/components/game/Doubles";
import { Tournaments } from "@/components/game/Tournaments";
import { Training } from "@/components/game/Training";
import { Trophies } from "@/components/game/Trophies";
import { ActionButton } from "@/components/game/ui";
import { createGame } from "@/game/engine";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

const TITLE = "Baseline: Ontario Tennis Career Simulator";
const DESC =
  "Text-based tennis career manager. Climb the authentic 5-tier Ontario Tennis Association junior pathway, the ITF Junior circuit, NCAA college tennis and the pro tour.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = ["Dashboard", "Training & Staff", "Tournaments", "Doubles Roster", "Trophy Room"] as const;

function Index() {
  const { state, loaded, update, commit } = useGame();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Dashboard");

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-xs text-muted-foreground">Loading career…</p>
      </main>
    );
  }

  if (!state) {
    return (
      <main>
        <h1 className="sr-only">{TITLE}</h1>
        <Creation onStart={(n, h, p) => commit(createGame(n, h, p))} />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-hi/15 text-sm font-bold text-emerald-hi">
              ⌁
            </span>
            <div>
              <h1 className="text-sm font-semibold leading-tight">{state.name}</h1>
              <p className="text-[11px] text-muted-foreground">
                Age {state.age} · Week {state.week} · Season {state.season} · Ontario, Canada
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span>
              UTR <span className="font-semibold text-emerald-hi">{state.utr.toFixed(2)}</span>
            </span>
            <span>
              Bank{" "}
              <span className="font-semibold text-foreground">
                ${Math.round(state.bank).toLocaleString()}
              </span>
            </span>
            <ActionButton
              variant="ghost"
              onClick={() => {
                if (confirm("Delete this career and start a new player?")) commit(null);
              }}
            >
              New career
            </ActionButton>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
                tab === t
                  ? "bg-emerald-hi/15 text-emerald-hi"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6">
        {tab === "Dashboard" && <Dashboard s={state} update={update} />}
        {tab === "Training & Staff" && <Training s={state} update={update} />}
        {tab === "Tournaments" && <Tournaments s={state} update={update} />}
        {tab === "Doubles Roster" && <Doubles s={state} update={update} />}
        {tab === "Trophy Room" && <Trophies s={state} />}
      </div>
    </main>
  );
}
