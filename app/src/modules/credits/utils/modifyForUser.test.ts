import type { AppContext } from "@app/context";
import * as Credits from "@app/modules/credits";

import { modifyForUser } from "./modifyForUser";

jest.mock("@app/modules/credits", () => ({
  getByUserId: jest.fn(),
  upsert: jest.fn(),
  db: jest.requireActual("@app/modules/credits/db"),
}));

jest.mock("./applyUpperClassRole", () => ({
  applyUpperClassRole: jest.fn(),
}));

const mockGetByUserId = Credits.getByUserId as jest.MockedFunction<
  typeof Credits.getByUserId
>;
const mockUpsert = Credits.upsert as jest.MockedFunction<typeof Credits.upsert>;

const ctx = {} as AppContext;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("modifyForUser", () => {
  it("does not throw and floors positive fractional byAmount", async () => {
    mockGetByUserId.mockResolvedValue({
      user_id: "u",
      credits: 0n,
      multiplier: 1,
      last_message_at: null,
      last_casino_at: null,
    });

    const result = await modifyForUser(ctx, {
      userId: "u",
      byAmount: 627.5,
    });

    expect(result.credits).toBe(627n);
    expect(result.multiplier).toBe(1);
    expect(mockUpsert).toHaveBeenCalledWith(ctx, {
      user_id: "u",
      credits: 627n,
      multiplier: 1,
      last_message_at: null,
      last_casino_at: null,
    });
  });

  it("floors negative fractional byAmount", async () => {
    mockGetByUserId.mockResolvedValue({
      user_id: "u",
      credits: 1000n,
      multiplier: 1,
      last_message_at: null,
      last_casino_at: null,
    });

    await modifyForUser(ctx, {
      userId: "u",
      byAmount: -100.7,
    });

    expect(mockUpsert).toHaveBeenCalledWith(ctx, {
      user_id: "u",
      credits: 899n,
      multiplier: 1,
      last_message_at: null,
      last_casino_at: null,
    });
  });

  it("short-circuits when floored byAmount is zero (no upsert)", async () => {
    mockGetByUserId.mockResolvedValue({
      user_id: "u",
      credits: 50n,
      multiplier: 1,
      last_message_at: null,
      last_casino_at: null,
    });

    const result = await modifyForUser(ctx, {
      userId: "u",
      byAmount: 0.3,
    });

    expect(result.credits).toBe(50n);
    expect(result.multiplier).toBe(1);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("sets last_casino_at when isCasino is true", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-29T12:00:00Z"));

    mockGetByUserId.mockResolvedValue({
      user_id: "u",
      credits: 100n,
      multiplier: 1,
      last_message_at: null,
      last_casino_at: null,
    });

    await modifyForUser(ctx, {
      userId: "u",
      byAmount: 10,
      isCasino: true,
    });

    expect(mockUpsert).toHaveBeenCalledWith(ctx, {
      user_id: "u",
      credits: 110n,
      multiplier: 1,
      last_message_at: null,
      last_casino_at: new Date("2026-06-29T12:00:00Z"),
    });

    jest.useRealTimers();
  });
});
