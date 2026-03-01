import type { Guild, GuildMember, HexColorString, Role } from "discord.js";
import type { RoleColorsResolvable } from "discord.js";
import { type RoleCreateOptions } from "discord.js";

import { BOOSTER_ICON_ROLE_PREFIX, COLOR_ROLE_PREFIX } from "@app/constants";

/** Discord treats 0x000000 as NIL; use 0x000001 so the role keeps a color. */
const DISCORD_COLOR_NIL = 0x000000;
const DISCORD_COLOR_MIN = 0x000001;

export const parseSingleColor = (
  color: number | string | readonly [number, number, number] | undefined,
): number | undefined => {
  if (color === undefined) return undefined;

  let value: number;
  if (typeof color === "string") {
    const hex = color.replace(/^#/, "").replace(/^0x/i, "");
    value = Number.parseInt(hex, 16);
    if (Number.isNaN(value)) return undefined;
  } else if (Array.isArray(color)) {
    const [r, g, b] = color;
    value = (r << 16) | (g << 8) | (b ?? 0);
  } else if (typeof color === "number") {
    value = color;
  } else {
    return undefined;
  }

  if (value === DISCORD_COLOR_NIL) return DISCORD_COLOR_MIN;

  return value;
};

export const parseRoleColors = (
  colors: RoleColorsResolvable | undefined,
): RoleColorsResolvable | undefined => {
  if (colors === undefined) return undefined;

  const primary = parseSingleColor(
    colors.primaryColor as number | string | readonly [number, number, number],
  );
  const out: RoleColorsResolvable = {
    primaryColor: primary ?? DISCORD_COLOR_MIN,
  };
  const secondary = parseSingleColor(
    colors.secondaryColor as
      | number
      | string
      | readonly [number, number, number],
  );
  if (secondary !== undefined) {
    out.secondaryColor = secondary;
  }
  const tertiary = parseSingleColor(
    colors.tertiaryColor as number | string | readonly [number, number, number],
  );
  if (tertiary !== undefined) {
    out.tertiaryColor = tertiary;
  }

  return out;
};

export const getClientRole = (guild: Guild): Role => {
  const me = guild.members.me;
  if (!me) {
    throw new Error("Guild client member not available");
  }

  const managed = me.roles.cache.find((r) => r.managed);
  if (!managed) {
    throw new Error("Bot managed role not found");
  }

  return managed;
};

export const getOrCreateRole = async (
  guild: Guild,
  options: Omit<RoleCreateOptions, "name"> & { name: string },
): Promise<Role> => {
  const clientRole = getClientRole(guild);
  let role = guild.roles.cache.find((r) => r.name === options.name);

  if (!role) {
    const { colors, ...rest } = options;
    role = await guild.roles.create({
      position: clientRole.position,
      permissions: [],
      ...rest,
      colors: parseRoleColors(colors),
    });
  }

  return role;
};

export const getMemberColorRole = (member: GuildMember): Role | undefined =>
  member.roles.cache.find((r) => r.name.startsWith(COLOR_ROLE_PREFIX));

export const getMemberBoosterIconRole = (
  member: GuildMember,
): Role | undefined =>
  member.roles.cache.find((r) => r.name.startsWith(BOOSTER_ICON_ROLE_PREFIX));

export const getMemberBoosterIconRoleName = (member: GuildMember): string =>
  `${BOOSTER_ICON_ROLE_PREFIX}${member.id.slice(0, 4)}`;

/** Deletes the role if it has no members, to clean up the server roles list. */
export const purgeRole = async (role: Role): Promise<void> => {
  if (role.members.size > 0) return;
  await role.delete();
};

const parseColorRoleName = (color: HexColorString): string =>
  color.replace("#", "").replace("000000", "000001").toUpperCase();

export const setMemberColorRole = async (
  member: GuildMember,
  [color1, color2]: [HexColorString, HexColorString | null],
): Promise<Role> => {
  const oldRole = getMemberColorRole(member);
  if (oldRole) {
    await member.roles.remove(oldRole);
    await purgeRole(oldRole);
  }

  const name =
    COLOR_ROLE_PREFIX +
    parseColorRoleName(color1) +
    (color2 ? `-${parseColorRoleName(color2)}` : "");

  const role = await getOrCreateRole(member.guild, {
    name,
    colors: {
      primaryColor: color1,
      secondaryColor: color2 ?? undefined,
    },
  });
  await member.roles.add(role);

  return role;
};
