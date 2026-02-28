import { getClientRole, getOrCreateRole } from "./roles";

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
      }),
    );
  });
});
