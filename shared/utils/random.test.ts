import { randomInt, randomValue } from "./random";

describe("randomInt", () => {
  it("returns a number within [min, max] inclusive", () => {
    for (let i = 0; i < 100; i++) {
      const n = randomInt(0, 10);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(10);
    }
  });

  it("returns min when min === max", () => {
    expect(randomInt(5, 5)).toBe(5);
  });

  it("returns value in range for negative bounds", () => {
    for (let i = 0; i < 50; i++) {
      const n = randomInt(-5, 5);
      expect(n).toBeGreaterThanOrEqual(-5);
      expect(n).toBeLessThanOrEqual(5);
    }
  });
});

describe("randomValue", () => {
  it("returns undefined for empty array", () => {
    expect(randomValue([])).toBeUndefined();
  });

  it("returns the only element for single-element array", () => {
    expect(randomValue([42])).toBe(42);
  });

  it("returns one of the array elements", () => {
    const arr = [1, 2, 3, 4, 5];
    for (let i = 0; i < 50; i++) {
      const v = randomValue(arr);
      expect(arr).toContain(v);
    }
  });
});
