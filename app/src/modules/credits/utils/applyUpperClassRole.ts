import { staticConfig } from "@app/config/static";
import type { AppContext } from "@app/context";
import { UPPER_CLASS_CREDITS } from "@app/modules/credits/constants";

export const applyUpperClassRole = async (
  ctx: AppContext,
  { userId, effective }: { userId: string; effective: bigint },
): Promise<void> => {
  const member = ctx.guild().members.cache.get(userId);
  if (!member || member.user.bot) return;

  const role = ctx.guild().roles.cache.get(staticConfig.roles.upperClass);
  if (!role) return;

  if (effective >= UPPER_CLASS_CREDITS) {
    await member.roles.add(role);
  } else {
    await member.roles.remove(role);
  }
};
