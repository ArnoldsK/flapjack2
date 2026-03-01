import { getBackgroundTextColor } from "./getBackgroundTextColor";

describe("getBackgroundTextColor", () => {
  it("returns white for dark background", () => {
    expect(getBackgroundTextColor("#000000")).toBe("#ffffff");
  });

  it("returns black for light background", () => {
    expect(getBackgroundTextColor("#ffffff")).toBe("#000000");
  });
});
