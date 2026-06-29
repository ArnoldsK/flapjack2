import type { APIEmbed, GuildMember } from "discord.js";
import {
  ActionRowBuilder,
  ComponentType,
  type Message,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

import { staticConfig } from "@app/config/static";
import { Unicode } from "@app/constants";
import { defineCommand } from "@app/discord/commands/defineCommand";
import { getCardsAttachment } from "@app/modules/canvas/actions/cardsAttachment";
import * as Credits from "@app/modules/credits";
import { isInteractionCollectorError } from "@app/utils/discord";
import type { JbCard, JbDrawResult } from "@app/utils/jacksbetter";
import { JacksBetter } from "@app/utils/jacksbetter";
import { joinAsLines } from "@app/utils/string";

const JB_SELECT_CUSTOM_ID = "jb-held-cards";
const SELECT_TIMEOUT_MS = 5 * 60_000;

const activeJbUsers = new Set<string>();

const isCasinoChannel = (channelId: string | null): boolean =>
  channelId === staticConfig.channels.casino;

const replyFlags = (channelId: string | null) =>
  isCasinoChannel(channelId) ? undefined : MessageFlags.Ephemeral;

const SUIT_SYMBOL: Record<JbCard["suit"], string> = {
  spades: Unicode.Spades,
  clubs: Unicode.Clubs,
  hearts: Unicode.Hearts,
  diamonds: Unicode.Diamonds,
};

const formatCard = (card: JbCard): string =>
  `${card.value}${SUIT_SYMBOL[card.suit]}`;

type MemberLike = GuildMember | { displayColor?: number } | null;

/** Build reply payload matching reference: accent color, media (cards), separator, text. */
const buildContainerEmbeds = (
  member: MemberLike,
  opts: {
    attachmentName?: string | null;
    descriptionLines: (string | null)[];
  },
): APIEmbed => {
  const description = joinAsLines(...opts.descriptionLines);
  const embed: APIEmbed = {
    description,
  };
  const displayColor =
    member && "displayColor" in member ? member.displayColor : undefined;
  if (displayColor != null) embed.color = displayColor;
  if (opts.attachmentName != null && opts.attachmentName !== "")
    embed.image = { url: `attachment://${opts.attachmentName}` };

  return embed;
};

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("jb")
    .setDescription("Play Jacks or Better video poker")
    .addStringOption((opt) =>
      opt
        .setName("amount")
        .setDescription("Bet amount (e.g. 100, 1k, all)")
        .setRequired(true),
    ),

  execute: async (ctx, interaction) => {
    const userId = interaction.user.id;

    if (activeJbUsers.has(userId)) {
      await interaction.reply({
        content: "You already have a running Jacks or Better game.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    activeJbUsers.add(userId);

    const creditsRow = await Credits.getByUserId(ctx, userId);
    const maxBet = Number(Credits.utils.effectiveCredits(creditsRow));

    let amount: number;
    try {
      const raw = interaction.options.getString("amount", true);
      amount = Credits.utils.parseCreditsAmount(raw, maxBet);
    } catch (err) {
      activeJbUsers.delete(userId);
      const msg = err instanceof Error ? err.message : "Invalid amount.";

      await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });

      return;
    }

    try {
      await Credits.utils.modifyForUser(ctx, {
        userId,
        byAmount: -amount,
        isCasino: true,
      });
    } catch {
      activeJbUsers.delete(userId);

      await interaction.reply({
        content: "Failed to deduct credits.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const game = new JacksBetter();
    game.deal({ bet: amount });

    const member = (interaction.member ?? null) as MemberLike;
    const attachment = getCardsAttachment({ cards: game.cards });
    const dealPayload = getDealReply(
      game,
      attachment,
      member,
      !isCasinoChannel(interaction.channelId),
    );

    let response: Message;
    try {
      const replyResult = await interaction.reply({
        ...dealPayload,
        flags: replyFlags(interaction.channelId),
        withResponse: true,
      });
      const message = replyResult.resource?.message;
      if (!message) throw new Error("Expected message in reply response");
      response = message;
    } catch (err) {
      activeJbUsers.delete(userId);
      await Credits.utils.modifyForUser(ctx, {
        userId,
        byAmount: amount,
        isCasino: true,
      });

      throw err;
    }

    try {
      const selectInteraction = await response.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        time: SELECT_TIMEOUT_MS,
        filter: (i) => i.user.id === userId,
      });

      const heldIds = new Set(
        selectInteraction.values.filter(
          (v) => v !== "none" && v !== "placeholder",
        ),
      );
      for (const card of game.cards) {
        game.setCardHold(card.id, heldIds.has(card.id));
      }

      const result = game.draw();
      const newRow = await Credits.utils.modifyForUser(ctx, {
        userId,
        byAmount: result.winAmount,
        isCasino: true,
      });
      const newCredits = Credits.utils.effectiveCredits(newRow);

      const drawMember = (selectInteraction.member ?? null) as MemberLike;
      await selectInteraction.update(
        getDrawReply(result, newCredits, drawMember),
      );
    } catch (err) {
      const editMember = (interaction.member ?? null) as MemberLike;

      if (isInteractionCollectorError(err)) {
        const newRow = await Credits.getByUserId(ctx, userId);
        const walletCredits = Credits.utils.effectiveCredits(newRow);

        await interaction.editReply(
          getTimedOutReply(amount, walletCredits, editMember),
        );
      } else {
        const refundRow = await Credits.utils.modifyForUser(ctx, {
          userId,
          byAmount: amount,
          isCasino: true,
        });
        const walletCredits = Credits.utils.effectiveCredits(refundRow);

        await interaction.editReply(
          getErrorReply(amount, walletCredits, editMember),
        );
      }
    } finally {
      activeJbUsers.delete(userId);
    }
  },
});

const getDealReply = (
  game: JacksBetter,
  attachment: ReturnType<typeof getCardsAttachment>,
  member: MemberLike,
  isEphemeral: boolean,
): {
  files: ReturnType<typeof getCardsAttachment>[];
  embeds: APIEmbed[];
  components: ActionRowBuilder<StringSelectMenuBuilder>[];
} => {
  const descriptionLines: (string | null)[] = [
    game.cardsHandName ? `-# ${game.cardsHandName}` : null,
    "Pick cards to hold.",
    isEphemeral ? "-# Dismissing message counts as a loss" : null,
  ];
  const embed = buildContainerEmbeds(member, {
    attachmentName: attachment.name ?? undefined,
    descriptionLines,
  });

  return {
    files: [attachment],
    embeds: [embed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(JB_SELECT_CUSTOM_ID)
          .setPlaceholder("Choose cards to hold")
          .setMinValues(1)
          .setMaxValues(game.cards.length + 1)
          .addOptions(
            ...game.cards.map((card) => ({
              label: formatCard(card),
              value: card.id,
              default: card.isHeld,
            })),
            { label: "None", value: "none" },
            { label: "Hold", value: "placeholder", default: true },
          ),
      ),
    ],
  };
};

const getDrawReply = (
  result: JbDrawResult,
  walletCredits: bigint,
  member: MemberLike,
): {
  files: ReturnType<typeof getCardsAttachment>[];
  embeds: APIEmbed[];
  components: [];
} => {
  const attachment = getCardsAttachment({ cards: result.cards, small: true });
  const outcome = result.handName
    ? `${result.handName}, you won`
    : result.isWin
      ? "You won"
      : "You lost";
  const amountStr = Credits.utils.formatCredits(result.betAmount, {
    withTimes: result.winMulti,
  });

  const embed = buildContainerEmbeds(member, {
    attachmentName: attachment.name ?? undefined,
    descriptionLines: [
      `**${outcome} ${amountStr}**`,
      `You have ${Credits.utils.formatCredits(walletCredits)} now.`,
    ],
  });

  return {
    files: [attachment],
    embeds: [embed],
    components: [],
  };
};

const getTimedOutReply = (
  bet: number,
  walletCredits: bigint,
  member: MemberLike,
): {
  embeds: APIEmbed[];
  components: [];
  files: [];
} => ({
  embeds: [
    buildContainerEmbeds(member, {
      descriptionLines: [
        `**No action within 5 minutes, you lost ${Credits.utils.formatCredits(bet)}**`,
        `You have ${Credits.utils.formatCredits(walletCredits)} now.`,
      ],
    }),
  ],
  components: [],
  files: [],
});

const getErrorReply = (
  bet: number,
  walletCredits: bigint,
  member: MemberLike,
): {
  embeds: APIEmbed[];
  components: [];
  files: [];
} => ({
  embeds: [
    buildContainerEmbeds(member, {
      descriptionLines: [
        `**An error has occurred, you get back ${Credits.utils.formatCredits(bet)}**`,
        `You have ${Credits.utils.formatCredits(walletCredits)} now.`,
      ],
    }),
  ],
  components: [],
  files: [],
});
