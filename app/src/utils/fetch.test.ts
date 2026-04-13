import z from "zod";

import { fetchData } from "./fetch";

describe("fetchData", () => {
  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it("fetches and validates JSON response", async () => {
    const schema = z.object({
      name: z.string(),
    });

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        name: "flapjack",
      }),
    } as unknown as Response);

    const result = await fetchData("https://api.example.com/data", schema, {
      method: "GET",
    });

    expect(result).toEqual({
      name: "flapjack",
    });
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/data", {
      method: "GET",
    });
  });

  it("throws useful error when response is not ok", async () => {
    const schema = z.object({
      name: z.string(),
    });

    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    } as unknown as Response);

    await expect(
      fetchData("https://api.example.com/data", schema),
    ).rejects.toThrow(
      "Unable to fetch data from https://api.example.com/data: 401 Unauthorized",
    );
  });

  it("throws useful error for invalid JSON body", async () => {
    const schema = z.object({
      name: z.string(),
    });

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error("Unexpected token");
      },
    } as unknown as Response);

    await expect(
      fetchData("https://api.example.com/data", schema),
    ).rejects.toThrow(
      "Unable to parse JSON response from https://api.example.com/data",
    );
  });

  it("throws useful error when schema validation fails", async () => {
    const schema = z.object({
      name: z.string(),
    });

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 123,
      }),
    } as unknown as Response);

    await expect(
      fetchData("https://api.example.com/data", schema),
    ).rejects.toThrow(
      "Response from https://api.example.com/data did not match expected schema",
    );
  });
});
