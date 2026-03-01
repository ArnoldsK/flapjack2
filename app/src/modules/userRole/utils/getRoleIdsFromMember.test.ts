import type { GuildMember } from "discord.js";

import { getRoleIdsFromMember } from "./getRoleIdsFromMember";

const createMockMember = (guildId: string, roleIds: string[]): GuildMember =>
  ({
    guild: { id: guildId },
    roles: {
      cache: new Map(roleIds.map((id) => [id, { id }])),
    },
  }) as unknown as GuildMember;

describe("getRoleIdsFromMember", () => {
  it("excludes @everyone role (guild id)", () => {
    const guildId = "guild-123";
    const member = createMockMember(guildId, ["role-a", guildId, "role-b"]);

    const ids = getRoleIdsFromMember(member);

    expect(ids).toEqual(["role-a", "role-b"]);
  });

  it("returns sorted role ids", () => {
    const member = createMockMember("guild-1", ["z-role", "a-role", "m-role"]);

    const ids = getRoleIdsFromMember(member);

    expect(ids).toEqual(["a-role", "m-role", "z-role"]);
  });

  it("returns empty array when member has only @everyone", () => {
    const guildId = "only-everyone";
    const member = createMockMember(guildId, [guildId]);

    const ids = getRoleIdsFromMember(member);

    expect(ids).toEqual([]);
  });
});
