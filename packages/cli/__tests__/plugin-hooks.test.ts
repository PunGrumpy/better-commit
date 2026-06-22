import { describe, expect, test } from "bun:test";

import { mergeUserConfig } from "../src/config/resolve.js";
import type { BetterCommitPlugin } from "../src/config/types.js";
import { validateCommitMessage } from "../src/core/validate-commit.js";
import { conventionalCommits } from "../src/plugins/conventional-commits.js";

const basePlugins = [
  conventionalCommits({ types: ["feat", "fix"] }),
] satisfies BetterCommitPlugin[];

describe("plugin validateMessage hooks", () => {
  test("hook rejects forbidden substring", async () => {
    const config = mergeUserConfig({
      plugins: [
        ...basePlugins,
        {
          id: "forbidden-words",
          hooks: {
            validateMessage: (message) => ({
              errors: message.includes("SECRET")
                ? ["Message must not contain SECRET"]
                : [],
              valid: !message.includes("SECRET"),
              warnings: [],
            }),
          },
        },
      ],
    });

    const result = await validateCommitMessage("feat: add SECRET feature", config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Message must not contain SECRET");
  });

  test("hook warnings merge with built-in warnings", async () => {
    const config = mergeUserConfig({
      plugins: [
        ...basePlugins,
        {
          id: "custom-warn",
          hooks: {
            validateMessage: () => ({
              errors: [],
              valid: true,
              warnings: ["Custom hook warning"],
            }),
          },
        },
      ],
    });

    const result = await validateCommitMessage("feat: add login.", config);

    expect(result.valid).toBe(true);
    expect(result.warnings).toContain("Subject should not end with a period");
    expect(result.warnings).toContain("Custom hook warning");
  });

  test("multiple hooks run in plugin order", async () => {
    const order: string[] = [];
    const config = mergeUserConfig({
      plugins: [
        ...basePlugins,
        {
          id: "hook-first",
          hooks: {
            validateMessage: () => {
              order.push("first");
              return { errors: [], valid: true, warnings: [] };
            },
          },
        },
        {
          id: "hook-second",
          hooks: {
            validateMessage: () => {
              order.push("second");
              return { errors: [], valid: true, warnings: [] };
            },
          },
        },
      ],
    });

    await validateCommitMessage("feat: add login", config);

    expect(order).toStrictEqual(["first", "second"]);
  });
});
