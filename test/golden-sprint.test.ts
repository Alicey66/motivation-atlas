import { describe, expect, it } from "vitest";
import { drainNourishment, HUNGER_DRAIN_MULTIPLIER, rankScores } from "../src/minigames/golden-sprint/game";

describe("Golden Sprint hunger toggle", () => {
  it("stops passive nourishment loss without preventing explicit damage", () => {
    expect(HUNGER_DRAIN_MULTIPLIER).toBe(4);
    expect(drainNourishment(100, 5, true, 1.2)).toBe(76);
    expect(drainNourishment(100, 5, false, 1.2)).toBe(100);

    const enemyDamage = 12;
    expect(drainNourishment(100 - enemyDamage, 5, false, 1.2)).toBe(88);
  });

  it("ranks leaderboard entries by points and then fastest time", () => {
    const ranked = rankScores([
      { name: "A", time: 70, points: 500 },
      { name: "B", time: 80, points: 700 },
      { name: "C", time: 60, points: 700 },
    ]);
    expect(ranked.map((entry) => entry.name)).toEqual(["C", "B", "A"]);
  });
});
