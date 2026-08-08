import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState } from "./types";

const KEY = "ota-career-sim-v2";

function migrate(state: GameState): GameState {
  if (!state.surfaceForm) {
    state.surfaceForm = { "Indoor Hard": 50, Hard: 50, Clay: 50, Grass: 50 };
  }
  state.sponsor ??= null;
  state.sponsorReputation ??= 20;
  state.racquet ??= "Vertex Tour";
  state.stringTension ??= "Medium";
  state.history ??= [];
  state.yearReview ??= null;
  state.rivals ??= [];
  state.nationalTeam ??= { active: false, caps: 0, medals: 0, history: [], lastCallupSeason: 0 };
  state.college ??= {
    school: null,
    conference: null,
    seasonsUsed: 0,
    redshirted: false,
    redshirtThisSeason: false,
    teamWins: 0,
    teamLosses: 0,
    individualWins: 0,
    individualLosses: 0,
    conferenceChampion: false,
  };
  // ensure each run has surface/venue for old saves
  for (const run of state.runs) {
    if (!run.surface) run.surface = "Indoor Hard";
    if (!run.venue) {
      run.venue = {
        id: "ontario-racquet-club",
        name: "Ontario Racquet Club",
        city: "Mississauga",
        region: "Ontario",
        surface: "Indoor Hard",
        indoor: true,
        travelCostTier: 1,
      };
    }
  }
  return state;
}

export function useGame() {
  const [state, setState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<GameState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = migrate(JSON.parse(raw) as GameState);
        ref.current = parsed;
        setState(parsed);
      }
    } catch {
      /* ignore corrupt save */
    }
    setLoaded(true);
  }, []);

  const commit = useCallback((next: GameState | null) => {
    ref.current = next;
    setState(next ? { ...next } : null);
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  }, []);

  /** Mutate a draft copy of the state and persist it. */
  const update = useCallback(
    (fn: (draft: GameState) => void) => {
      const cur = ref.current;
      if (!cur) return;
      const draft: GameState = JSON.parse(JSON.stringify(cur));
      fn(draft);
      commit(draft);
    },
    [commit],
  );

  return { state, loaded, update, commit };
}
