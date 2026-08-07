import { createGame, nextWeek, utrCeiling } from "@/game/engine";
import { test, expect } from "vitest";
test("utr respects age ceiling", () => {
  const s = createGame("T", "Right", "All-Court");
  for (let i = 0; i < 52 * 6; i++) nextWeek(s, { tennis: 5, fitness: 3, study: 2 });
  console.log("age", s.age, "utr", s.utr, "ceiling", utrCeiling(s), "tennis", s.attrs.tennis);
  expect(s.utr).toBeLessThanOrEqual(utrCeiling(s) + 0.6);
});
