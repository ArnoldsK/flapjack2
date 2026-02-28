import {
  getClientRole,
  getOrCreateRole,
  parseRoleColors,
  parseSingleColor,
} from "./roles";

const createMockRole = (
  overrides: Partial<{
    id: string;
    name: string;
    managed: boolean;
    position: number;
  }> = {},
) => ({
  id: "role-id",
  name: "TestRole",
  managed: false,
  position: 1,
  ...overrides,
});

describe("parseSingleColor", () => {
  it("returns undefined for undefined input", () => {
    expect(parseSingleColor(undefined)).toBeUndefined();
  });

  it("normalizes number 0 to 0x000001 (Discord NIL)", () => {
    expect(parseSingleColor(0)).toBe(0x000001);
  });

  it("returns number unchanged when non-zero", () => {
    expect(parseSingleColor(0xff0000)).toBe(0xff0000);
    expect(parseSingleColor(0xffffff)).toBe(0xffffff);
  });

  it("parses hex string and normalizes #000000 to 0x000001", () => {
    expect(parseSingleColor("#000000")).toBe(0x000001);
    expect(parseSingleColor("0x000000")).toBe(0x000001);
  });

  it("parses hex string and returns value when non-zero", () => {
    expect(parseSingleColor("#ff0000")).toBe(0xff0000);
    expect(parseSingleColor("#00ff00")).toBe(0x00ff00);
  });

  it("returns undefined for invalid hex string", () => {
    expect(parseSingleColor("nothex")).toBeUndefined();
    expect(parseSingleColor("#gggggg")).toBeUndefined();
  });

  it("converts RGB tuple to number and normalizes [0,0,0] to 0x000001", () => {
    expect(parseSingleColor([0, 0, 0])).toBe(0x000001);
  });

  it("converts RGB tuple to number when non-zero", () => {
    expect(parseSingleColor([255, 0, 0])).toBe(0xff0000);
    expect(parseSingleColor([0, 255, 0])).toBe(0x00ff00);
  });
});

describe("parseRoleColors", () => {
  it("returns undefined for undefined input", () => {
    expect(parseRoleColors(undefined)).toBeUndefined();
  });

  it("normalizes primaryColor 0 to 0x000001", () => {
    expect(parseRoleColors({ primaryColor: 0 })).toEqual({
      primaryColor: 0x000001,
    });
  });

  it("passes through primaryColor when non-zero", () => {
    expect(parseRoleColors({ primaryColor: 0xff0000 })).toEqual({
      primaryColor: 0xff0000,
    });
  });

  it("normalizes secondaryColor and tertiaryColor when 0", () => {
    expect(
      parseRoleColors({
        primaryColor: 0xffffff,
        secondaryColor: 0,
        tertiaryColor: 0,
      }),
    ).toEqual({
      primaryColor: 0xffffff,
      secondaryColor: 0x000001,
      tertiaryColor: 0x000001,
    });
  });

  it("parses string primaryColor and normalizes #000000", () => {
    expect(parseRoleColors({ primaryColor: "#000000" })).toEqual({
      primaryColor: 0x000001,
    });
  });
});

describe("getClientRole", () => {
  it("throws when guild.members.me is null", () => {
    const guild = {
      members: { me: null },
    };
    expect(() => getClientRole(guild as never)).toThrow(
      "Guild client member not available",
    );
  });

  it("throws when no managed role in cache", () => {
    const guild = {
      members: {
        me: {
          roles: {
            cache: {
              find: () => undefined,
            },
          },
        },
      },
    };
    expect(() => getClientRole(guild as never)).toThrow(
      "Bot managed role not found",
    );
  });

  it("returns the managed role when present", () => {
    const managedRole = createMockRole({ managed: true, id: "managed-1" });
    const guild = {
      members: {
        me: {
          roles: {
            cache: {
              find: (pred: (r: { managed: boolean }) => boolean) =>
                pred(managedRole) ? managedRole : undefined,
            },
          },
        },
      },
    };
    expect(getClientRole(guild as never)).toBe(managedRole);
  });
});

describe("getOrCreateRole", () => {
  it("returns existing role when found by name and does not call create", async () => {
    const existingRole = createMockRole({ name: "MyRole" });
    const createMock = jest.fn();
    const clientRole = createMockRole({ managed: true, position: 5 });
    const guild = {
      members: {
        me: {
          roles: {
            cache: {
              find: (pred: (r: { managed: boolean }) => boolean) =>
                pred(clientRole) ? clientRole : undefined,
            },
          },
        },
      },
      roles: {
        cache: {
          find: (pred: (r: { name: string }) => boolean) =>
            pred(existingRole) ? existingRole : undefined,
        },
        create: createMock,
      },
    };
    const result = await getOrCreateRole(guild as never, {
      name: "MyRole",
    });
    expect(result).toBe(existingRole);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("calls create and returns new role when no role with name exists", async () => {
    const clientRole = createMockRole({ managed: true, position: 5 });
    const createdRole = createMockRole({ name: "NewRole", id: "new-id" });
    const createMock = jest.fn().mockResolvedValue(createdRole);
    const guild = {
      members: {
        me: {
          roles: {
            cache: {
              find: (pred: (r: { managed: boolean }) => boolean) =>
                pred(clientRole) ? clientRole : undefined,
            },
          },
        },
      },
      roles: {
        cache: {
          find: () => undefined,
        },
        create: createMock,
      },
    };
    const result = await getOrCreateRole(guild as never, {
      name: "NewRole",
    });
    expect(result).toBe(createdRole);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "NewRole",
        position: 5,
        permissions: [],
        colors: undefined,
      }),
    );
  });

  it("calls create with colors.primaryColor normalized from 0 to 0x000001 (Discord NIL)", async () => {
    const clientRole = createMockRole({ managed: true, position: 5 });
    const createdRole = createMockRole({ name: "DarkRole", id: "dark-id" });
    const createMock = jest.fn().mockResolvedValue(createdRole);
    const guild = {
      members: {
        me: {
          roles: {
            cache: {
              find: (pred: (r: { managed: boolean }) => boolean) =>
                pred(clientRole) ? clientRole : undefined,
            },
          },
        },
      },
      roles: {
        cache: { find: () => undefined },
        create: createMock,
      },
    };
    await getOrCreateRole(guild as never, {
      name: "DarkRole",
      colors: { primaryColor: 0 },
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "DarkRole",
        colors: { primaryColor: 0x000001 },
      }),
    );
  });

  it("calls create with colors passed through when primaryColor is non-zero", async () => {
    const clientRole = createMockRole({ managed: true, position: 5 });
    const createdRole = createMockRole({ name: "RedRole", id: "red-id" });
    const createMock = jest.fn().mockResolvedValue(createdRole);
    const guild = {
      members: {
        me: {
          roles: {
            cache: {
              find: (pred: (r: { managed: boolean }) => boolean) =>
                pred(clientRole) ? clientRole : undefined,
            },
          },
        },
      },
      roles: {
        cache: { find: () => undefined },
        create: createMock,
      },
    };
    await getOrCreateRole(guild as never, {
      name: "RedRole",
      colors: { primaryColor: 0xff0000 },
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "RedRole",
        colors: { primaryColor: 0xff0000 },
      }),
    );
  });
});
