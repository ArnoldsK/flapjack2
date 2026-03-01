import { canvasFont } from "./font";

describe("canvasFont", () => {
  it("returns size and Roboto family without bold", () => {
    expect(canvasFont(16)).toBe("16px 'Roboto', sans-serif");
  });

  it("includes bold when options.bold is true", () => {
    expect(canvasFont(16, { bold: true })).toBe(
      "bold 16px 'Roboto', sans-serif",
    );
  });

  it("uses custom family when provided", () => {
    expect(canvasFont(12, { family: "monospace" })).toBe("12px monospace");
  });
});
