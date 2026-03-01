import { getEmojiIdFromString, getNativeEmojiFromString } from "./emoji";

describe("getEmojiIdFromString", () => {
  it("extracts id from static emoji string", () => {
    expect(getEmojiIdFromString("<:coffee:123456789>")).toBe("123456789");
  });

  it("extracts id from animated emoji string", () => {
    expect(getEmojiIdFromString("<a:wave:987654321>")).toBe("987654321");
  });

  it("returns undefined for plain text", () => {
    expect(getEmojiIdFromString("hello")).toBeUndefined();
  });

  it("returns undefined for native emoji", () => {
    expect(getEmojiIdFromString("👍")).toBeUndefined();
  });
});

describe("getNativeEmojiFromString", () => {
  it("extracts single native emoji", () => {
    expect(getNativeEmojiFromString("👍")).toBe("👍");
  });

  it("extracts first emoji when multiple present", () => {
    const result = getNativeEmojiFromString("👍 🎉");
    expect(result).toBe("👍");
  });

  it("returns undefined for custom emoji format", () => {
    expect(getNativeEmojiFromString("<:coffee:123>")).toBeUndefined();
  });

  it("returns undefined for plain text", () => {
    expect(getNativeEmojiFromString("hello")).toBeUndefined();
  });
});
