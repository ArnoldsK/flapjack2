import { parseHexColor } from "./color";

describe("parseHexColor", () => {
  it("adds # prefix when missing and parses valid hex", () => {
    expect(parseHexColor("A9C9FF")).toBe("#A9C9FF");
    expect(parseHexColor("ffffff")).toBe("#FFFFFF");
  });

  it("returns uppercase hex when input has #", () => {
    expect(parseHexColor("#a9c9ff")).toBe("#A9C9FF");
    expect(parseHexColor("#FFFFFF")).toBe("#FFFFFF");
  });

  it("returns null for invalid format", () => {
    expect(parseHexColor("short")).toBeNull();
    expect(parseHexColor("#gggggg")).toBeNull();
    expect(parseHexColor("#12345")).toBeNull();
    expect(parseHexColor("#1234567")).toBeNull();
    expect(parseHexColor("")).toBeNull();
  });

  it("maps #000000 to #000001 (Discord disallows pure black)", () => {
    expect(parseHexColor("#000000")).toBe("#000001");
    expect(parseHexColor("000000")).toBe("#000001");
  });

  it("returns valid hex for other 6-digit hex strings", () => {
    expect(parseHexColor("#FFBBEC")).toBe("#FFBBEC");
    expect(parseHexColor("B492D4")).toBe("#B492D4");
  });
});
