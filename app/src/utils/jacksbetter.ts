import { randomInt } from "@shared/utils/random";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PokerSolver = require("pokersolver");

interface PokerSolverCard {
  value: string;
  suit: string;
}

interface PokerSolverWinner {
  name: string;
  descr: string;
  cards: PokerSolverCard[];
}

export interface JbDrawResult {
  cards: JbCard[];
  isWin: boolean;
  winMulti: number;
  betAmount: number;
  winAmount: number;
  handName: HandName | null;
}

export interface JbCard {
  /** PokerSolver format, e.g. "Qh", "Td" */
  id: string;
  /** Display value, e.g. "Q", "10" */
  value: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  /** Whether the card is held for draw */
  isHeld: boolean;
}

enum HandName {
  RoyalFlush = "Royal Flush",
  StraightFlush = "Straight Flush",
  FourOfAKind = "Four of a Kind",
  FullHouse = "Full House",
  Flush = "Flush",
  Straight = "Straight",
  ThreeOfAKind = "Three of a Kind",
  TwoPairs = "Two Pairs",
  JacksOrBetter = "Jacks or Better",
}

const PAY_TABLE = new Map<HandName, number>([
  [HandName.RoyalFlush, 250],
  [HandName.StraightFlush, 50],
  [HandName.FourOfAKind, 25],
  [HandName.FullHouse, 9],
  [HandName.Flush, 6],
  [HandName.Straight, 4],
  [HandName.ThreeOfAKind, 3],
  [HandName.TwoPairs, 2],
  [HandName.JacksOrBetter, 1],
]);

const CARD_VALUES = new Set([
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
]);

const CARD_JACK_VALUES = new Set(["J", "Q", "K", "A"]);

const CARD_SUITS = new Set(["h", "c", "d", "s"]);

const CARD_SUIT_NAME = new Map<string, JbCard["suit"]>([
  ["c", "clubs"],
  ["d", "diamonds"],
  ["h", "hearts"],
  ["s", "spades"],
]);

export class JacksBetter {
  #bet = 0;
  #deck: JbCard[] = [];
  #cards: JbCard[] = [];

  get bet(): number {
    return this.#bet;
  }

  get cards(): JbCard[] {
    return [...this.#cards];
  }

  get cardsHandName(): HandName | null {
    const cardIds = this.#cards.map((c) => c.id);
    const hand = PokerSolver.Hand.solve(cardIds, "jacksbetter");

    return this.#getHandName(hand);
  }

  deal({ bet }: { bet: number }): void {
    this.#bet = bet;
    this.#resetDeck();
    this.#dealCards();
  }

  setCardHold(id: string, isHeld: boolean): void {
    const idx = this.#cards.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Card ${id} not found`);
    this.#cards[idx].isHeld = isHeld;
  }

  draw(): JbDrawResult {
    if (this.#cards.length !== 5) throw new Error("Not enough cards to draw");

    this.#drawNewCards();
    const handName = this.cardsHandName;
    const winMulti = handName ? PAY_TABLE.get(handName)! : 0;

    return {
      cards: this.#cards,
      isWin: winMulti > 0,
      winMulti,
      betAmount: this.#bet,
      winAmount: this.#bet * winMulti,
      handName,
    };
  }

  #resetDeck(): void {
    this.#deck = [];
    for (const value of CARD_VALUES) {
      for (const suit of CARD_SUITS) {
        this.#deck.push({
          id: `${value}${suit}`,
          value: value === "T" ? "10" : value,
          suit: CARD_SUIT_NAME.get(suit)!,
          isHeld: false,
        });
      }
    }
  }

  #dealCards(): void {
    if (this.#cards.length > 0)
      throw new Error("Can't deal over existing cards");
    for (let i = 0; i < 5; i++) {
      this.#cards.push(this.#takeDeckCard());
    }
  }

  #drawNewCards(): void {
    for (let i = 0; i < this.#cards.length; i++) {
      if (!this.#cards[i].isHeld) {
        this.#cards[i] = this.#takeDeckCard();
      }
    }
  }

  #takeDeckCard(): JbCard {
    if (this.#deck.length === 0) throw new Error("The deck is empty");
    const takeIndex = randomInt(0, this.#deck.length - 1);
    const [card] = this.#deck.splice(takeIndex, 1);
    if (!card) throw new Error("Could not take a card");
    return card;
  }

  #getHandName(winner: PokerSolverWinner): HandName | null {
    switch (winner.name) {
      case "Straight Flush":
        return winner.descr === "Royal Flush"
          ? HandName.RoyalFlush
          : HandName.StraightFlush;
      case "Four of a Kind":
        return HandName.FourOfAKind;
      case "Full House":
        return HandName.FullHouse;
      case "Flush":
        return HandName.Flush;
      case "Straight":
        return HandName.Straight;
      case "Three of a Kind":
        return HandName.ThreeOfAKind;
      case "Two Pair":
        return HandName.TwoPairs;
      case "Pair":
        if (winner.cards[0] && CARD_JACK_VALUES.has(winner.cards[0].value)) {
          return HandName.JacksOrBetter;
        }
        break;
    }

    return null;
  }
}
