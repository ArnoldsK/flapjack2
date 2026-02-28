type AmountSuffix = "K" | "M" | "B" | "T";

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
  value: number,
): { amount: number; suffix: AmountSuffix | null } => {
  const isNegative = value < 0;
  const absValue = Math.abs(Math.floor(value));

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

export const formatCredits = (value: number): string => {
  const { amount, suffix } = formatCreditsAmount(value);

  if (!amount) {
    return "no credits";
  }

  return [amount, suffix].join("");
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
