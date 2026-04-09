import { existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const CACHE_FILENAME = ".bc-cache.json";

export interface CommitCache {
  type: string;
  scope: string;
  subject: string;
  breaking?: boolean;
  body?: string;
  breakingChange?: string;
}

export const getCachePath = (cwd: string = process.cwd()): string =>
  join(cwd, CACHE_FILENAME);

export const readCache = (cwd: string = process.cwd()): CommitCache | null => {
  const path = getCachePath(cwd);
  if (!existsSync(path)) {
    return null;
  }
  try {
    const raw = JSON.parse(readFileSync(path, "utf8"));
    if (
      typeof raw.type === "string" &&
      typeof raw.scope === "string" &&
      typeof raw.subject === "string"
    ) {
      return raw as CommitCache;
    }
    return null;
  } catch {
    return null;
  }
};

export const writeCache = async (
  data: CommitCache,
  cwd: string = process.cwd()
): Promise<void> => {
  const path = getCachePath(cwd);
  await writeFile(path, JSON.stringify(data, null, 2), "utf8");
};
