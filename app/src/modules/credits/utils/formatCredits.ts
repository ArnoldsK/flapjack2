import { Unicode } from "@app/constants";

type AmountSuffix = "K" | "M" | "B" | "T";

/** Order must match reference: first match where value >= minValue (high to low). */
const CREDITS_EMOJI_MAP: Array<{ minValue: number; emoji: string }> = [
  { minValue: 100_000, emoji: "<:Coins10000:1204533924559065099>" },
  { minValue: 10_000, emoji: "<:Coins1000:1204533922923548753>" },
  { minValue: 2500, emoji: "<:Coins250:1204533921652412487>" },
  { minValue: 100, emoji: "<:Coins100:1204533919073042432>" },
  { minValue: 250, emoji: "<:Coins25:1204533917361643630>" },
  { minValue: 50, emoji: "<:Coins5:1204533915113496717>" },
  { minValue: 40, emoji: "<:Coins4:1204533896092450856>" },
  { minValue: 30, emoji: "<:Coins3:1204533887649194074>" },
  { minValue: 20, emoji: "<:Coins2:1204533886361673788>" },
  { minValue: 1, emoji: "<:Coins1:1204533883702612018>" },
];

const getCreditsEmoji = (value: number | bigint): string => {
  const n = typeof value === "bigint" ? Number(value) : value;
  const abs = n < 0 ? -n : n;
  const entry = CREDITS_EMOJI_MAP.find(({ minValue }) => abs >= minValue);

  return entry?.emoji ?? "";
};

const TIERS: Array<{
  from: number;
  to: number;
  suffix: AmountSuffix | null;
  multiplier: number;
}> = [
  { from: 0, to: 9999, suffix: null, multiplier: 1 },
  { from: 10_000, to: 999_999, suffix: "K", multiplier: 1000 },
  { from: 1_000_000, to: 9_999_999, suffix: "M", multiplier: 1_000_000 },
  { from: 10_000_000, to: 99_999_999, suffix: "M", multiplier: 1_000_000 },
  { from: 100_000_000, to: 999_999_999, suffix: "M", multiplier: 1_000_000 },
  {
    from: 1_000_000_000,
    to: 999_999_999_999,
    suffix: "B",
    multiplier: 1_000_000_000,
  },
  {
    from: 1_000_000_000_000,
    to: Infinity,
    suffix: "T",
    multiplier: 1_000_000_000_000,
  },
];

const roundToDecimals = (value: number, decimals: number): number =>
  Number(value.toFixed(decimals));

export const formatCreditsAmount = (
  value: number | bigint,
): { amount: number; suffix: AmountSuffix | null } => {
  const n = typeof value === "bigint" ? Number(value) : value;
  const isNegative = n < 0;
  const absValue = Math.abs(Math.floor(n));

  const item = TIERS.find(({ from, to }) => absValue >= from && absValue <= to);
  const divider = item?.multiplier ?? 1;
  const dividedValue = absValue / divider;
  const integerLength = String(Math.floor(dividedValue)).length;

  let decimals = 0;
  if (integerLength === 1) {
    decimals = 2;
  } else if (integerLength === 2) {
    decimals = 1;
  }

  const amount =
    roundToDecimals(dividedValue, decimals) * (isNegative ? -1 : 1);

  return {
    amount,
    suffix: item?.suffix ?? null,
  };
};

export const formatCredits = (
  value: number | bigint,
  options?: { withTimes?: number },
): string => {
  const { amount, suffix } = formatCreditsAmount(value);

  if (!amount) {
    return "no credits";
  }

  const valueForEmoji =
    options?.withTimes !== undefined && options.withTimes > 1
      ? typeof value === "bigint"
        ? value * BigInt(options.withTimes)
        : value * options.withTimes
      : value;
  const emoji = getCreditsEmoji(valueForEmoji);
  const times =
    options?.withTimes !== undefined && options.withTimes > 1
      ? `${Unicode.Times}${options.withTimes}`
      : "";

  return [amount, suffix, times, emoji ? Unicode.ThinSpace : "", emoji].join(
    "",
  );
};

export const parseCreditsAmount = (value: string, max: number): number => {
  const trimmed = value.trim().toLowerCase();

  let amount: number;
  if (trimmed === "all") {
    amount = max;
  } else if (trimmed.endsWith("k")) {
    amount = Number.parseFloat(trimmed) * 1000;
  } else if (trimmed.endsWith("m")) {
    amount = Number.parseFloat(trimmed) * 1_000_000;
  } else if (trimmed.endsWith("b")) {
    amount = Number.parseFloat(trimmed) * 1_000_000_000;
  } else {
    amount = Number.parseInt(trimmed, 10);
  }

  amount = Math.floor(amount);
  amount = Math.max(0, Math.min(amount, max));

  if (Number.isNaN(amount)) {
    throw new Error("Invalid amount format");
  }

  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  return amount;
};
