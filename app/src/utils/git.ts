import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

export interface Commit {
  hash: string;
  message: string;
}

const rootDir =
  path.basename(process.cwd()) === "app"
    ? path.resolve(process.cwd(), "..")
    : process.cwd();
const LAST_COMMIT_HASH_PATH = path.join(rootDir, ".last-commit-hash");

export const getNewCommits = async (): Promise<Commit[]> => {
  const { stdout: log } = await promisify(exec)(
    "git log -n 10 --oneline --no-merges --no-decorate",
    { cwd: rootDir },
  );

  if (!log) {
    return [];
  }

  const commits = getLogCommits(log);

  if (commits.length === 0) {
    return [];
  }

  const latestHash = commits[commits.length - 1]?.hash;
  if (!latestHash) {
    return [];
  }

  const savedHash = await getFileContents(LAST_COMMIT_HASH_PATH);
  await saveLatestCommitHash(latestHash);

  if (!savedHash) {
    return [];
  }

  const savedHashCommitsIndex = commits.findIndex(
    (commit) => commit.hash === savedHash.trim(),
  );

  if (savedHashCommitsIndex === -1) {
    return [];
  }

  return commits.slice(savedHashCommitsIndex + 1);
};

/**
 * Returns parsed commit data.
 * Oldest first.
 */
const getLogCommits = (log: string): Commit[] => {
  const lines = log.trim().split("\n").filter(Boolean);

  return lines
    .map((line) => {
      const [hash, ...words] = line.split(" ");

      return {
        hash,
        message: words.join(" ").trim(),
      };
    })
    .reverse();
};

const saveLatestCommitHash = async (hash: string): Promise<void> => {
  await fs.promises.writeFile(LAST_COMMIT_HASH_PATH, hash);
};

const getFileContents = async (filePath: string): Promise<string | null> => {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const buffer = await fs.promises.readFile(filePath);

    return buffer.toString();
  } catch {
    return null;
  }
};
