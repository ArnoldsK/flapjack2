export const getGameOutcomeText = ({
  playerMainHand,
  playerSplitHand,
  dealerHasBusted,
  dealerHasBlackjack,
  receivedAmount,
}: {
  playerMainHand: {
    playerHasBusted: boolean;
    playerHasBlackjack: boolean;
  };
  playerSplitHand?: {
    playerHasBusted: boolean;
    playerHasBlackjack: boolean;
  };
  dealerHasBusted: boolean;
  dealerHasBlackjack: boolean;
  receivedAmount: number;
}): string => {
  const bust =
    playerMainHand.playerHasBusted || !!playerSplitHand?.playerHasBusted;
  const hasDoubleBj =
    playerMainHand.playerHasBlackjack && !!playerSplitHand?.playerHasBlackjack;
  const hasBj =
    playerMainHand.playerHasBlackjack || !!playerSplitHand?.playerHasBlackjack;

  if (bust) {
    return "Bust, you lost";
  }
  if (dealerHasBusted) {
    return "Dealer bust, you won";
  }
  if (hasDoubleBj) {
    return "Double blackjack, you won";
  }
  if (hasBj && dealerHasBlackjack) {
    return "Draw, both have blackjack";
  }
  if (dealerHasBlackjack) {
    return "Dealer blackjack, you lost";
  }
  if (hasBj) {
    return "Blackjack, you won";
  }

  if (receivedAmount > 0) {
    return "You won";
  }
  if (receivedAmount === 0) {
    return "Draw, you get back";
  }

  return "You lost";
};
