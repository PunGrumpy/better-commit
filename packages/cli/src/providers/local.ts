import type { AIProvider, GenerateMessageContext } from "./types.js";

const extractFilePaths = (diff: string): string[] => {
  const paths = new Set<string>();
  const lines = diff.split("\n");
  for (const line of lines) {
    if (line.startsWith("+++ ") || line.startsWith("--- ")) {
      const path = line.slice(4).replace(/^\w\//, "");
      if (path !== "/dev/null") {
        paths.add(path);
      }
    }
  }
  return [...paths];
};

const inferTypeFromPaths = (paths: string[]): string => {
  const pathStr = paths.join(" ").toLowerCase();
  if (
    pathStr.includes("test") ||
    pathStr.includes("spec") ||
    pathStr.includes(".test.")
  ) {
    return "test";
  }
  if (
    pathStr.includes("readme") ||
    pathStr.includes("docs") ||
    pathStr.includes(".md")
  ) {
    return "docs";
  }
  if (
    pathStr.includes("ci") ||
    pathStr.includes("github") ||
    pathStr.includes(".yml") ||
    pathStr.includes(".yaml")
  ) {
    return "ci";
  }
  if (pathStr.includes("package") || pathStr.includes("lock")) {
    return "chore";
  }
  return "feat";
};

const inferScopeFromPaths = (paths: string[]): string => {
  for (const path of paths) {
    const parts = path.split("/").filter(Boolean);
    if (parts[0] === "packages" && parts[1]) {
      return parts[1];
    }
    if (parts[0] === "src" && parts[1]) {
      return parts[1];
    }
    if (parts.length >= 2) {
      return parts[0];
    }
  }
  return "";
};

const buildSubject = (paths: string[], _type: string): string => {
  const mainPaths = paths.slice(0, 3);
  const desc = mainPaths
    .map((p) => p.split("/").pop() ?? p)
    .filter(Boolean)
    .join(", ");
  return desc ? `update ${desc}` : "update files";
};

export const localProvider: AIProvider = {
  generateMessage(
    diff: string,
    context: GenerateMessageContext
  ): Promise<string> {
    const paths = extractFilePaths(diff);
    const type = context.type ?? inferTypeFromPaths(paths);
    const scope = context.scope ?? inferScopeFromPaths(paths);
    const subject = buildSubject(paths, type);
    const prefix = scope ? `${type}(${scope}): ` : `${type}: `;
    return Promise.resolve(`${prefix}${subject}`);
  },
  name: "local",
};
