import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState } from "./types";

const KEY = "ota-career-sim-v1";

export function useGame() {
  const [state, setState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<GameState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameState;
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
