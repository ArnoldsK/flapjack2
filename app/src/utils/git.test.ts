import type { exec } from "node:child_process";

const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();
const mockExistsSync = jest.fn();

const mockExecImpl = jest.fn<
  ReturnType<typeof exec>,
  Parameters<typeof exec>
>();

jest.mock("node:child_process", () => ({
  exec: (...args: Parameters<typeof exec>) => mockExecImpl(...args),
}));
jest.mock("node:fs", () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  promises: {
    readFile: (...args: unknown[]) => mockReadFile(...args),
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
  },
}));
jest.mock("node:util", () => ({
  ...jest.requireActual<typeof import("node:util")>("node:util"),
  promisify: (_fn: typeof exec) => {
    return (cmd: string, opts: { cwd?: string }) =>
      new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        mockExecImpl(cmd, opts, (err, stdout, stderr) => {
          if (err) reject(err);
          else
            resolve({
              stdout: stdout != null ? String(stdout) : "",
              stderr: stderr != null ? String(stderr) : "",
            });
        });
      });
  },
}));

import { getNewCommits } from "./git";

describe("getNewCommits", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecImpl.mockImplementation((_cmd, _opts, cb) => {
      const callback = (typeof _opts === "function" ? _opts : cb) as (
        err: Error | null,
        stdout: string,
        stderr: string,
      ) => void;
      callback(
        null,
        "hash3 Third commit\nhash2 Second commit\nhash1 First commit",
        "",
      );

      return undefined as unknown as ReturnType<typeof exec>;
    });
  });

  it("returns new commits after saved hash (oldest first)", async () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFile.mockResolvedValue(Buffer.from("hash1"));

    const result = await getNewCommits();

    expect(result).toEqual([
      { hash: "hash2", message: "Second commit" },
      { hash: "hash3", message: "Third commit" },
    ]);
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining(".last-commit-hash"),
      "hash3",
    );
  });

  it("returns empty array when no saved hash file exists", async () => {
    mockExistsSync.mockReturnValue(false);

    const result = await getNewCommits();

    expect(result).toEqual([]);
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining(".last-commit-hash"),
      "hash3",
    );
  });

  it("returns empty array when git log is empty", async () => {
    mockExecImpl.mockImplementation((_cmd, _opts, cb) => {
      const callback = (typeof _opts === "function" ? _opts : cb) as (
        err: Error | null,
        stdout: string,
        stderr: string,
      ) => void;
      callback(null, "", "");

      return undefined as unknown as ReturnType<typeof exec>;
    });
    mockExistsSync.mockReturnValue(true);
    mockReadFile.mockResolvedValue(Buffer.from("somehash"));

    const result = await getNewCommits();

    expect(result).toEqual([]);
  });

  it("returns empty array when saved hash not in last 10 commits", async () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFile.mockResolvedValue(Buffer.from("oldhash"));

    const result = await getNewCommits();

    expect(result).toEqual([]);
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining(".last-commit-hash"),
      "hash3",
    );
  });
});
