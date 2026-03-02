import type { Channel, GuildMember } from "discord.js";
import { ChannelType } from "discord.js";

import {
  embedAuthor,
  isDiscordAttachmentUrl,
  isInteractionCollectorError,
  isTextChannel,
} from "./discord";

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

describe("isTextChannel", () => {
  it("returns true for GuildText channel", () => {
    const ch = { type: ChannelType.GuildText } as Channel;

    expect(isTextChannel(ch)).toBe(true);
  });

  it("returns false for null or undefined", () => {
    expect(isTextChannel(null)).toBe(false);
    expect(isTextChannel(undefined)).toBe(false);
  });

  it("returns false for non-GuildText channel type", () => {
    const ch = { type: ChannelType.GuildVoice } as Channel;

    expect(isTextChannel(ch)).toBe(false);
  });
});

describe("isInteractionCollectorError", () => {
  it("returns true for Error with InteractionCollectorError in name", () => {
    const err = new Error("some message");
    err.name = "InteractionCollectorError";

    expect(isInteractionCollectorError(err)).toBe(true);
  });

  it("returns false for non-Error values", () => {
    expect(isInteractionCollectorError("not an error")).toBe(false);
    expect(isInteractionCollectorError(null)).toBe(false);
    expect(
      isInteractionCollectorError({ name: "InteractionCollectorError" }),
    ).toBe(false);
  });

  it("returns false when Error name does not include InteractionCollectorError", () => {
    const err = new Error("some message");
    err.name = "OtherError";

    expect(isInteractionCollectorError(err)).toBe(false);
  });
});
