import type { Guild, Role } from "discord.js";
import { type RoleCreateOptions } from "discord.js";

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
    role = await guild.roles.create({
      position: clientRole.position,
      permissions: [],
      ...options,
    });
  }

  return role;
};
