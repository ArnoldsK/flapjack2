import {
  getExperienceForLevel,
  getExperienceLevelData,
  RANK_MAX_LEVEL,
} from "./getLevelData";

describe("getExperienceForLevel", () => {
  it("returns 0 for level 1", () => {
    expect(getExperienceForLevel(1)).toBe(0);
  });

  it("returns positive exp for level 2", () => {
    const exp = getExperienceForLevel(2);
    expect(exp).toBeGreaterThan(0);
  });

  it("returns strictly increasing exp for consecutive levels", () => {
    let prev = getExperienceForLevel(1);
    for (let lvl = 2; lvl <= 10; lvl++) {
      const next = getExperienceForLevel(lvl);
      expect(next).toBeGreaterThan(prev);
      prev = next;
    }
  });

  it("returns a finite number for max level", () => {
    const exp = getExperienceForLevel(RANK_MAX_LEVEL);
    expect(Number.isFinite(exp)).toBe(true);
    expect(exp).toBeGreaterThanOrEqual(0);
  });
});

describe("getExperienceLevelData", () => {
  it("returns level 1 and exp 0 for zero exp", () => {
    const data = getExperienceLevelData(0);
    expect(data.exp).toBe(0);
    expect(data.lvl).toBe(1);
    expect(data.min).toBe(0);
    expect(data.max).toBeGreaterThan(0);
    expect(data.percent).toBe(0);
  });

  it("returns level 1 with percent in [0, 100] for exp within level 1 range", () => {
    const min = getExperienceForLevel(1);
    const max = getExperienceForLevel(2);
    const mid = Math.floor((min + max) / 2);
    const data = getExperienceLevelData(mid);
    expect(data.lvl).toBe(1);
    expect(data.min).toBe(min);
    expect(data.max).toBe(max);
    expect(data.percent).toBeGreaterThanOrEqual(0);
    expect(data.percent).toBeLessThanOrEqual(100);
  });

  it("returns level 3 with 0% progress when exp equals getExperienceForLevel(2)", () => {
    const expForLvl2 = getExperienceForLevel(2);
    const data = getExperienceLevelData(expForLvl2);
    expect(data.lvl).toBe(3);
    expect(data.min).toBe(expForLvl2);
    expect(data.max).toBe(getExperienceForLevel(3));
  });

  it("returns max level when exp is at RANK_MAX_LEVEL threshold", () => {
    const expMax = getExperienceForLevel(RANK_MAX_LEVEL);
    const data = getExperienceLevelData(expMax);
    expect(data.lvl).toBe(RANK_MAX_LEVEL);
    expect(data.min).toBe(expMax);
    expect(data.max).toBe(expMax);
  });

  it("returns exp unchanged in the result", () => {
    const exp = 12345;
    const data = getExperienceLevelData(exp);
    expect(data.exp).toBe(exp);
  });
});
