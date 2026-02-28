import type { Guild, Role } from "discord.js";
import type { RoleColorsResolvable } from "discord.js";
import { type RoleCreateOptions } from "discord.js";

/** Discord treats 0x000000 as NIL; use 0x000001 so the role keeps a color. */
const DISCORD_COLOR_NIL = 0x000000;
const DISCORD_COLOR_MIN = 0x000001;

const parseSingleColor = (
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

const parseRoleColors = (
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
