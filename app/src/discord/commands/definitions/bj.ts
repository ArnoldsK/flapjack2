import type { APIEmbed, GuildMember } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type Message,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { actions, Game } from "engine-blackjack-ts";

import { staticConfig } from "@app/config/static";
import { Unicode } from "@app/constants";
import { defineCommand } from "@app/discord/commands/defineCommand";
import * as Credits from "@app/modules/credits";
import { getGameOutcomeText } from "@app/utils/blackjack";
import { isInteractionCollectorError } from "@app/utils/discord";
import { joinAsLines, ucFirst } from "@app/utils/string";

const BJ_TIMEOUT_MS = 5 * 60_000;

type Action = "stand" | "hit" | "surrender" | "double" | "split";
type HandSide = "left" | "right";

const activeBjUsers = new Set<string>();

const isCasinoChannel = (channelId: string | null): boolean =>
  channelId === staticConfig.channels.casino;

const replyFlags = (channelId: string | null) =>
  isCasinoChannel(channelId) ? undefined : MessageFlags.Ephemeral;

type MemberLike = GuildMember | { displayColor?: number } | null;

const SUIT_SYMBOL: Record<string, string> = {
  clubs: Unicode.Clubs,
  spades: Unicode.Spades,
  hearts: Unicode.Hearts,
  diamonds: Unicode.Diamonds,
};

const formatCard = (card: { text: string; suite: string }): string =>
  `${card.text}${SUIT_SYMBOL[card.suite] ?? ""}`;

const formatCards = (
  cards: Array<{ text: string; suite: string }>,
  dealerHasHole = false,
): string => {
  const parts = cards.map(formatCard);

  if (dealerHasHole) {
    parts.push("?");
  }

  return parts.join(` ${Unicode.Middot} `);
};

const formatHandValue = (
  value: { lo: number; hi: number },
  dealerHasHole = false,
): string => {
  const { lo, hi } = value;
  const text = hi === lo ? `${hi}` : `${lo}/${hi}`;

  return dealerHasHole ? `${text}?` : text;
};

const encodeCustomId = (action: Action, handSide: HandSide): string =>
  `${action}::${handSide}`;

const decodeCustomId = (
  customId: string,
): { action: Action; handSide: HandSide } => {
  const [action, handSide] = customId.split("::");

  return { action: action as Action, handSide: handSide as HandSide };
};

const createGame = (): Game =>
  new Game(undefined, {
    decks: 2,
    standOnSoft17: true,
    double: "any",
    split: true,
    doubleAfterSplit: true,
    surrender: true,
    insurance: false,
    showdownAfterAceSplit: true,
  });

export default defineCommand({
  version: 1,

  data: new SlashCommandBuilder()
    .setName("bj")
    .setDescription("Get as close to 21 as possible")
    .addStringOption((opt) =>
      opt
        .setName("amount")
        .setDescription("Amount of credits (e.g. 100, 1k, all)")
        .setRequired(true),
    ),

  execute: async (ctx, interaction) => {
    const userId = interaction.user.id;

    if (activeBjUsers.has(userId)) {
      await interaction.reply({
        content: "You already have a running Blackjack game.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    activeBjUsers.add(userId);

    const creditsRow = await Credits.getByUserId(ctx, userId);
    const maxBet = Number(Credits.utils.effectiveCredits(creditsRow));

    let amount: number;
    try {
      const raw = interaction.options.getString("amount", true);
      amount = Credits.utils.parseCreditsAmount(raw, maxBet);
    } catch (err) {
      activeBjUsers.delete(userId);
      const msg = err instanceof Error ? err.message : "Invalid amount.";

      await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });

      return;
    }

    try {
      await Credits.utils.modifyForUser(ctx, {
        userId,
        byAmount: -amount,
      });
    } catch {
      activeBjUsers.delete(userId);

      await interaction.reply({
        content: "Failed to deduct credits.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const game = createGame();
    const rowAfterDeduct = await Credits.getByUserId(ctx, userId);
    const canDoubleNow =
      rowAfterDeduct != null &&
      Number(Credits.utils.effectiveCredits(rowAfterDeduct)) >= amount;

    game.dispatch(actions.deal({ bet: amount }));

    const member = (interaction.member ?? null) as MemberLike;
    const { embed, components, gameOver, wonAmount } = parseGame(
      game,
      member,
      canDoubleNow,
    );
    const description = gameOver
      ? await handleGameOver(ctx, game, wonAmount, userId, member)
      : undefined;
    const ephemeral = !isCasinoChannel(interaction.channelId);

    let response: Message;
    try {
      const replyResult = await interaction.reply({
        embeds: [
          {
            ...embed,
            description,
            footer:
              ephemeral && !gameOver
                ? { text: "Dismissing message counts as a loss" }
                : undefined,
          },
        ],
        components,
        flags: replyFlags(interaction.channelId),
        withResponse: true,
      });
      const message = replyResult.resource?.message;
      if (!message) throw new Error("Expected message in reply response");
      response = message;
    } catch (replyErr) {
      activeBjUsers.delete(userId);
      await Credits.utils.modifyForUser(ctx, {
        userId,
        byAmount: amount,
      });

      throw replyErr;
    }

    try {
      if (gameOver) {
        return;
      }

      await handleAwaitResponse(
        ctx,
        response,
        game,
        userId,
        interaction,
        member,
      );
    } catch (err) {
      const state = game.getState();
      const lostAmount = state.finalBet || state.initialBet;
      const editMember = (interaction.member ?? null) as MemberLike;

      try {
        if (isInteractionCollectorError(err)) {
          const walletRow = await Credits.getByUserId(ctx, userId);

          await interaction.editReply(
            getTimeoutReply(lostAmount, walletRow, editMember),
          );
        } else {
          const newRow = await Credits.utils.modifyForUser(ctx, {
            userId,
            byAmount: lostAmount,
          });

          await interaction.editReply(
            getErrorRefundReply(lostAmount, newRow, editMember),
          );
        }
      } catch {
        // Ignore follow-up edit errors
      }
    } finally {
      activeBjUsers.delete(userId);
    }
  },
});

const parseGame = (
  game: Game,
  member: MemberLike,
  canDouble: boolean,
): {
  embed: APIEmbed;
  components: ActionRowBuilder<ButtonBuilder>[];
  gameOver: boolean;
  wonAmount: number;
} => {
  const state = game.getState();
  const isPlayerTurn = ["player-turn-right", "player-turn-left"].includes(
    state.stage,
  );
  const currentHandSide: HandSide =
    state.stage === "player-turn-left" ? "left" : "right";
  const rightHand = state.handInfo.right;
  const _left = state.handInfo.left;
  const leftHand = _left.cards?.length ? _left : undefined;
  const currentHand = currentHandSide === "right" ? rightHand : leftHand;
  const dealerHasHole = state.dealerCards.length === 1;
  const gameOver = state.stage === "done";
  const wonAmount = state.wonOnLeft + state.wonOnRight;

  const actionsList: Action[] = [];
  if (currentHand) {
    for (const [action, available] of Object.entries(
      currentHand.availableActions as unknown as Record<string, boolean>,
    )) {
      if ((action === "double" || action === "split") && !canDouble) {
        continue;
      }
      if (available) {
        actionsList.push(action as Action);
      }
    }
  }

  let actionRow: ActionRowBuilder<ButtonBuilder> | undefined;
  if (isPlayerTurn && actionsList.length > 0) {
    actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...actionsList.map((action) =>
        new ButtonBuilder()
          .setCustomId(encodeCustomId(action, currentHandSide))
          .setLabel(ucFirst(action))
          .setStyle(ButtonStyle.Secondary),
      ),
    );
  }

  const formatActive = (label: string, active: boolean): string =>
    active ? `__${label}__` : label;

  const rightLabel = leftHand
    ? formatActive("Right hand", !gameOver && currentHandSide === "right")
    : formatActive("Your hand", !gameOver);
  const fields: { inline?: boolean; name: string; value: string }[] = [
    {
      inline: true,
      name: rightLabel,
      value: joinAsLines(
        formatCards(rightHand.cards),
        `Value: ${formatHandValue(rightHand.playerValue)}`,
      ),
    },
    ...(leftHand
      ? [
          {
            inline: true,
            name: formatActive(
              "Left hand",
              !gameOver && currentHandSide === "left",
            ),
            value: joinAsLines(
              formatCards(leftHand.cards),
              `Value: ${formatHandValue(leftHand.playerValue)}`,
            ),
          },
        ]
      : []),
    {
      inline: !leftHand,
      name: "Dealer hand",
      value: joinAsLines(
        formatCards(state.dealerCards, dealerHasHole),
        `Value: ${formatHandValue(state.dealerValue, dealerHasHole)}`,
      ),
    },
  ];

  const color =
    member && "displayColor" in member ? member.displayColor : undefined;

  return {
    embed: {
      ...(color != null && { color }),
      fields,
    },
    components: actionRow ? [actionRow] : [],
    gameOver,
    wonAmount,
  };
};

const handleGameOver = async (
  ctx: Parameters<Parameters<typeof defineCommand>[0]["execute"]>[0],
  game: Game,
  wonAmount: number,
  userId: string,
  _member: MemberLike,
): Promise<string> => {
  const newRow = await Credits.utils.modifyForUser(ctx, {
    userId,
    byAmount: wonAmount,
  });
  const walletCredits = Credits.utils.effectiveCredits(newRow);
  const state = game.getState();
  const rightHand = state.handInfo.right;
  const leftHand = state.handInfo.left?.cards?.length
    ? state.handInfo.left
    : undefined;
  const bet = state.finalBet || state.initialBet;
  const receivedAmount = wonAmount - bet;

  const outcome = getGameOutcomeText({
    playerMainHand: rightHand,
    playerSplitHand: leftHand,
    dealerHasBusted: state.dealerHasBusted,
    dealerHasBlackjack: state.dealerHasBlackjack,
    receivedAmount,
  });
  const resultStr = Credits.utils.formatCredits(
    receivedAmount > 0 ? receivedAmount : bet,
    {
      withTimes: wonAmount > 0 ? wonAmount / bet : 0,
    },
  );

  return joinAsLines(
    `**${outcome} ${resultStr}**`,
    `You have ${Credits.utils.formatCredits(walletCredits)} now`,
  );
};

const handleAwaitResponse = async (
  ctx: Parameters<Parameters<typeof defineCommand>[0]["execute"]>[0],
  response: Message,
  game: Game,
  userId: string,
  _originalInteraction: { member: unknown },
  _member: MemberLike,
): Promise<void> => {
  const interaction = await response.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: BJ_TIMEOUT_MS,
    filter: (i) => i.user.id === userId,
  });

  await interaction.deferUpdate();

  const { action, handSide } = decodeCustomId(interaction.customId);

  switch (action) {
    case "stand":
      game.dispatch(actions.stand({ position: handSide }));
      break;
    case "hit":
      game.dispatch(actions.hit({ position: handSide }));
      break;
    case "surrender":
      game.dispatch(actions.surrender());
      break;
    case "double":
      game.dispatch(actions.double({ position: handSide }));
      break;
    case "split":
      game.dispatch(actions.split());
      break;
    default:
      break;
  }

  const state = game.getState();
  if (action === "double" || action === "split") {
    await Credits.utils.modifyForUser(ctx, {
      userId,
      byAmount: -state.initialBet,
    });
  }

  const { embed, components, gameOver, wonAmount } = parseGame(
    game,
    (interaction.member ?? null) as MemberLike,
    false,
  );
  const description = gameOver
    ? await handleGameOver(
        ctx,
        game,
        wonAmount,
        userId,
        (interaction.member ?? null) as MemberLike,
      )
    : undefined;

  const nextResponse = await interaction.editReply({
    embeds: [{ ...embed, description: description ?? embed.description }],
    components,
  });

  if (gameOver) {
    return;
  }

  await handleAwaitResponse(
    ctx,
    nextResponse,
    game,
    userId,
    _originalInteraction,
    (interaction.member ?? null) as MemberLike,
  );
};

const getTimeoutReply = (
  lostAmount: number,
  walletRow: Credits.db.Table | null,
  member: MemberLike,
): {
  embeds: APIEmbed[];
  components: [];
} => {
  const walletCredits = Credits.utils.effectiveCredits(walletRow);
  const color =
    member && "displayColor" in member ? member.displayColor : undefined;

  return {
    embeds: [
      {
        ...(color != null && { color }),
        description: joinAsLines(
          `**No action within 5 minutes, you lost ${Credits.utils.formatCredits(lostAmount)}**`,
          `You have ${Credits.utils.formatCredits(walletCredits)} now`,
        ),
      },
    ],
    components: [],
  };
};

const getErrorRefundReply = (
  refundAmount: number,
  walletRow: Credits.db.Table,
  member: MemberLike,
): {
  embeds: APIEmbed[];
  components: [];
} => {
  const walletCredits = Credits.utils.effectiveCredits(walletRow);
  const color =
    member && "displayColor" in member ? member.displayColor : undefined;

  return {
    embeds: [
      {
        ...(color != null && { color }),
        description: joinAsLines(
          `**An error has occurred, you get back ${Credits.utils.formatCredits(refundAmount)}**`,
          `You have ${Credits.utils.formatCredits(walletCredits)} now`,
        ),
      },
    ],
    components: [],
  };
};
