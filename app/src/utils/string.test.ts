import { joinAsLines, stringToIntHash } from "./string";

describe("joinAsLines", () => {
  it("joins non-null values with newlines", () => {
    expect(joinAsLines("a", "b", "c")).toBe("a\nb\nc");
  });

  it("filters out null and undefined", () => {
    expect(joinAsLines("a", null, "b", undefined, "c")).toBe("a\nb\nc");
  });

  it("returns empty string when all values are nullish", () => {
    expect(joinAsLines(null, undefined)).toBe("");
  });
});

describe("stringToIntHash", () => {
  it("returns same value for same input and range", () => {
    expect(stringToIntHash("abc")).toBe(stringToIntHash("abc"));
    expect(stringToIntHash("job-a,job-b", 1, 1000)).toBe(
      stringToIntHash("job-a,job-b", 1, 1000),
    );
  });

  it("returns value within [min, max) for default range", () => {
    const v = stringToIntHash("test");

    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(500);
  });

  it("returns value within custom [min, max)", () => {
    const v = stringToIntHash("anything", 1, 100);

    expect(v).toBeGreaterThanOrEqual(1);
    expect(v).toBeLessThan(100);
  });

  it("returns different values for different inputs (typical case)", () => {
    const a = stringToIntHash("job-a,job-b", 1, 999999);
    const b = stringToIntHash("job-a,job-b,job-c", 1, 999999);

    expect(a).not.toBe(b);
  });
});
