import { isDiscordAttachmentUrl } from "./isDiscordAttachmentUrl";

describe("isDiscordAttachmentUrl", () => {
  it("returns true for cdn.discordapp.com attachments path", () => {
    expect(
      isDiscordAttachmentUrl(
        "https://cdn.discordapp.com/attachments/123/456/image.png",
      ),
    ).toBe(true);
  });

  it("returns true for media.discordapp.net attachments path", () => {
    expect(
      isDiscordAttachmentUrl(
        "https://media.discordapp.net/attachments/123/456/file.jpg",
      ),
    ).toBe(true);
  });

  it("returns false when host is not Discord CDN", () => {
    expect(
      isDiscordAttachmentUrl("https://example.com/attachments/123/456.png"),
    ).toBe(false);
  });

  it("returns false when path does not start with /attachments", () => {
    expect(
      isDiscordAttachmentUrl("https://cdn.discordapp.com/assets/abc.png"),
    ).toBe(false);
  });

  it("returns false for invalid URL string", () => {
    expect(isDiscordAttachmentUrl("not a url")).toBe(false);
  });
});
