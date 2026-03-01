import { getGameOutcomeText } from "./blackjack";

describe("getGameOutcomeText", () => {
  it("returns 'Bust, you lost' when player busted", () => {
    expect(
      getGameOutcomeText({
        playerMainHand: { playerHasBusted: true, playerHasBlackjack: false },
        dealerHasBusted: false,
        dealerHasBlackjack: false,
        receivedAmount: -100,
      }),
    ).toBe("Bust, you lost");
  });

  it("returns 'Dealer bust, you won' when dealer busted", () => {
    expect(
      getGameOutcomeText({
        playerMainHand: { playerHasBusted: false, playerHasBlackjack: false },
        dealerHasBusted: true,
        dealerHasBlackjack: false,
        receivedAmount: 100,
      }),
    ).toBe("Dealer bust, you won");
  });

  it("returns 'Double blackjack, you won' when player has double blackjack", () => {
    expect(
      getGameOutcomeText({
        playerMainHand: { playerHasBusted: false, playerHasBlackjack: true },
        playerSplitHand: { playerHasBusted: false, playerHasBlackjack: true },
        dealerHasBusted: false,
        dealerHasBlackjack: false,
        receivedAmount: 200,
      }),
    ).toBe("Double blackjack, you won");
  });

  it("returns 'Draw, both have blackjack' when both have blackjack", () => {
    expect(
      getGameOutcomeText({
        playerMainHand: { playerHasBusted: false, playerHasBlackjack: true },
        dealerHasBusted: false,
        dealerHasBlackjack: true,
        receivedAmount: 0,
      }),
    ).toBe("Draw, both have blackjack");
  });

  it("returns 'Dealer blackjack, you lost' when dealer has blackjack", () => {
    expect(
      getGameOutcomeText({
        playerMainHand: { playerHasBusted: false, playerHasBlackjack: false },
        dealerHasBusted: false,
        dealerHasBlackjack: true,
        receivedAmount: -100,
      }),
    ).toBe("Dealer blackjack, you lost");
  });

  it("returns 'Blackjack, you won' when player has blackjack", () => {
    expect(
      getGameOutcomeText({
        playerMainHand: { playerHasBusted: false, playerHasBlackjack: true },
        dealerHasBusted: false,
        dealerHasBlackjack: false,
        receivedAmount: 150,
      }),
    ).toBe("Blackjack, you won");
  });

  it("returns 'You won' / 'Draw, you get back' / 'You lost' by receivedAmount", () => {
    expect(
      getGameOutcomeText({
        playerMainHand: { playerHasBusted: false, playerHasBlackjack: false },
        dealerHasBusted: false,
        dealerHasBlackjack: false,
        receivedAmount: 50,
      }),
    ).toBe("You won");
    expect(
      getGameOutcomeText({
        playerMainHand: { playerHasBusted: false, playerHasBlackjack: false },
        dealerHasBusted: false,
        dealerHasBlackjack: false,
        receivedAmount: 0,
      }),
    ).toBe("Draw, you get back");
    expect(
      getGameOutcomeText({
        playerMainHand: { playerHasBusted: false, playerHasBlackjack: false },
        dealerHasBusted: false,
        dealerHasBlackjack: false,
        receivedAmount: -50,
      }),
    ).toBe("You lost");
  });
});
