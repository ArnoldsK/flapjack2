import { Unicode } from "@app/constants";

import {
  formatCredits,
  formatCreditsAmount,
  parseCreditsAmount,
} from "./formatCredits";

describe("formatCreditsAmount", () => {
  it("returns amount and null suffix for 0", () => {
    expect(formatCreditsAmount(0)).toEqual({ amount: 0, suffix: null });
  });

  it("returns raw amount for values under 10k", () => {
    expect(formatCreditsAmount(500)).toEqual({ amount: 500, suffix: null });
    expect(formatCreditsAmount(9999)).toEqual({ amount: 9999, suffix: null });
  });

  it("returns K suffix for 10k–999k", () => {
    expect(formatCreditsAmount(10_000)).toEqual({ amount: 10, suffix: "K" });
    expect(formatCreditsAmount(12_500)).toEqual({ amount: 12.5, suffix: "K" });
    expect(formatCreditsAmount(999_999)).toEqual({ amount: 1000, suffix: "K" });
  });

  it("returns M suffix for millions", () => {
    expect(formatCreditsAmount(1_000_000)).toEqual({ amount: 1, suffix: "M" });
    expect(formatCreditsAmount(1_500_000)).toEqual({
      amount: 1.5,
      suffix: "M",
    });
    expect(formatCreditsAmount(123_456_789)).toEqual({
      amount: 123,
      suffix: "M",
    });
  });

  it("returns B suffix for billions", () => {
    expect(formatCreditsAmount(1_000_000_000)).toEqual({
      amount: 1,
      suffix: "B",
    });
    expect(formatCreditsAmount(2_500_000_000)).toEqual({
      amount: 2.5,
      suffix: "B",
    });
  });

  it("returns T suffix for trillions", () => {
    expect(formatCreditsAmount(1_000_000_000_000)).toEqual({
      amount: 1,
      suffix: "T",
    });
  });

  it("handles negative values", () => {
    expect(formatCreditsAmount(-500)).toEqual({ amount: -500, suffix: null });
    expect(formatCreditsAmount(-1_500_000)).toEqual({
      amount: -1.5,
      suffix: "M",
    });
  });
});

describe("formatCredits", () => {
  it("returns 'no credits' for zero", () => {
    expect(formatCredits(0)).toBe("no credits");
  });

  it("returns formatted string with emoji for positive values", () => {
    expect(formatCredits(500)).toBe(
      `500${Unicode.ThinSpace}<:Coins100:1204533919073042432>`,
    );
    expect(formatCredits(10_000)).toContain("10K");
    expect(formatCredits(10_000)).toContain("<:Coins1000:");
    expect(formatCredits(1_500_000)).toContain("1.5M");
    expect(formatCredits(1_000_000_000)).toContain("1B");
  });

  it("returns formatted string with emoji for negative values", () => {
    expect(formatCredits(-100)).toContain("-100");
    expect(formatCredits(-1_000_000)).toContain("-1M");
  });

  it("includes withTimes when provided", () => {
    const result = formatCredits(100, { withTimes: 2 });
    expect(result).toContain("100");
    expect(result).toContain("×2");
  });
});

describe("parseCreditsAmount", () => {
  it("parses 'all' as max", () => {
    expect(parseCreditsAmount("all", 50_000)).toBe(50_000);
    expect(parseCreditsAmount("  ALL  ", 100)).toBe(100);
  });

  it("parses k suffix", () => {
    expect(parseCreditsAmount("1k", 100_000)).toBe(1000);
    expect(parseCreditsAmount("2.5k", 100_000)).toBe(2500);
    expect(parseCreditsAmount("10K", 100_000)).toBe(10_000);
  });

  it("parses m suffix", () => {
    expect(parseCreditsAmount("1m", 10_000_000)).toBe(1_000_000);
    expect(parseCreditsAmount("1.5M", 10_000_000)).toBe(1_500_000);
  });

  it("parses b suffix", () => {
    expect(parseCreditsAmount("1b", 2_000_000_000)).toBe(1_000_000_000);
  });

  it("parses plain integer", () => {
    expect(parseCreditsAmount("100", 1000)).toBe(100);
    expect(parseCreditsAmount("9999", 100_000)).toBe(9999);
  });

  it("clamps to max", () => {
    expect(parseCreditsAmount("all", 500)).toBe(500);
    expect(parseCreditsAmount("1000", 500)).toBe(500);
    expect(parseCreditsAmount("2m", 1_000_000)).toBe(1_000_000);
  });

  it("throws for invalid format", () => {
    expect(() => parseCreditsAmount("abc", 1000)).toThrow(
      "Invalid amount format",
    );
    expect(() => parseCreditsAmount("", 1000)).toThrow();
  });

  it("throws for zero or negative amount", () => {
    expect(() => parseCreditsAmount("0", 1000)).toThrow(
      "Amount must be positive",
    );
    expect(() => parseCreditsAmount("all", 0)).toThrow(
      "Amount must be positive",
    );
  });
});
