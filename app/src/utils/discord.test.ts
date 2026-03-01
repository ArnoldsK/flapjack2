import type { GuildMember } from "discord.js";

import { embedAuthor, isDiscordAttachmentUrl } from "./discord";

const createMockMember = (
  overrides: Partial<{ displayName: string }> = {},
): GuildMember =>
  ({
    displayName: "TestUser",
    displayAvatarURL: jest.fn(() => "https://cdn.example/avatar.png"),
    ...overrides,
  }) as unknown as GuildMember;

describe("embedAuthor", () => {
  it("returns name from member displayName", () => {
    const member = createMockMember({ displayName: "CoolNick" });

    const author = embedAuthor(member);

    expect(author.name).toBe("CoolNick");
  });

  it("calls displayAvatarURL with png, forceStatic, size 32", () => {
    const member = createMockMember();

    embedAuthor(member);

    expect(member.displayAvatarURL).toHaveBeenCalledWith({
      extension: "png",
      forceStatic: true,
      size: 32,
    });
  });

  it("returns icon_url from displayAvatarURL result", () => {
    const member = createMockMember();
    (member.displayAvatarURL as jest.Mock).mockReturnValue(
      "https://cdn.example/custom.png",
    );

    const author = embedAuthor(member);

    expect(author.icon_url).toBe("https://cdn.example/custom.png");
  });
});

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
