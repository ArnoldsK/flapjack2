import { shuffle } from "./array";

describe("shuffle", () => {
  it("returns an array of the same length as input", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it("returns an array containing exactly the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.slice().sort()).toEqual(input.slice().sort());
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });

  it("eventually produces a different order (probabilistic)", () => {
    const input = [1, 2, 3, 4, 5];
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(shuffle([...input]).join(","));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
