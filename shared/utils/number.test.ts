import { clamp, range } from "./number";

describe("clamp", () => {
  it("returns value when within min and max", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("clamps to min when value is below min", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(2, 5, 10)).toBe(5);
  });

  it("clamps to max when value is above max", () => {
    expect(clamp(11, 0, 10)).toBe(10);
    expect(clamp(100, 0, 10)).toBe(10);
  });

  it("handles min === max", () => {
    expect(clamp(3, 5, 5)).toBe(5);
    expect(clamp(5, 5, 5)).toBe(5);
  });
});

describe("range", () => {
  it("maps value linearly from [minA, maxA] to [minB, maxB]", () => {
    expect(range(50, 0, 100, 0, 10)).toBe(5);
    expect(range(0, 0, 100, 0, 10)).toBe(0);
    expect(range(100, 0, 100, 0, 10)).toBe(10);
  });

  it("maps to minB when value is minA", () => {
    expect(range(0, 0, 100, 10, 20)).toBe(10);
  });

  it("maps to maxB when value is maxA", () => {
    expect(range(100, 0, 100, 10, 20)).toBe(20);
  });

  it("clamps when value is outside [minA, maxA]", () => {
    expect(range(-10, 0, 100, 0, 10)).toBe(0);
    expect(range(150, 0, 100, 0, 10)).toBe(10);
  });
});
