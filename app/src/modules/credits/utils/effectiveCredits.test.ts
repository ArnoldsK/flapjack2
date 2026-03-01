import { effectiveCredits } from "./effectiveCredits";

describe("effectiveCredits", () => {
  it("returns 0n for null", () => {
    expect(effectiveCredits(null)).toBe(0n);
  });

  it("returns credits * multiplier for a row", () => {
    expect(
      effectiveCredits({
        user_id: "u",
        credits: 100n,
        multiplier: 1,
        last_message_at: null,
      }),
    ).toBe(100n);
    expect(
      effectiveCredits({
        user_id: "u",
        credits: 50n,
        multiplier: -1,
        last_message_at: null,
      }),
    ).toBe(-50n);
  });
});
