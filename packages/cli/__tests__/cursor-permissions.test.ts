import { describe, expect, test } from "bun:test";

import {
  isPermissionRejection,
  mapPermissionOptionsToSelect,
  resolveCursorPermission,
} from "../src/ai/cursor-permissions.js";
import type { AcpPermissionOption } from "../src/ai/cursor-permissions.js";

const sampleOptions: AcpPermissionOption[] = [
  { kind: "allow", name: "Allow once", optionId: "allow-once" },
  { kind: "allow", name: "Allow always", optionId: "allow-always" },
  { kind: "reject", name: "Reject", optionId: "reject-once" },
];

describe("mapPermissionOptionsToSelect", () => {
  test("maps ACP options to clack select choices", () => {
    expect(mapPermissionOptionsToSelect(sampleOptions)).toEqual([
      { label: "Allow once", value: "allow-once" },
      { label: "Allow always", value: "allow-always" },
      { label: "Reject", value: "reject-once" },
    ]);
  });
});

describe("isPermissionRejection", () => {
  test("returns true for reject kind", () => {
    expect(isPermissionRejection("reject-once", sampleOptions)).toBe(true);
  });

  test("returns false for allow-once", () => {
    expect(isPermissionRejection("allow-once", sampleOptions)).toBe(false);
  });

  test("returns true for deny option ids without kind", () => {
    expect(isPermissionRejection("deny", [])).toBe(true);
  });
});

describe("resolveCursorPermission auto-approve", () => {
  const originalEnv = process.env.BETTER_COMMIT_CURSOR_AUTO_APPROVE;

  test("selects allow-once when available", async () => {
    process.env.BETTER_COMMIT_CURSOR_AUTO_APPROVE = "1";
    const result = await resolveCursorPermission("Run command", [
      { kind: "allow", name: "Allow once", optionId: "allow-once" },
      { kind: "allow", name: "Allow always", optionId: "allow-always" },
      { kind: "reject", name: "Reject", optionId: "reject-once" },
    ]);
    expect(result).toBe("allow-once");
    process.env.BETTER_COMMIT_CURSOR_AUTO_APPROVE = originalEnv;
  });

  test("never selects allow-always when allow-once is absent", async () => {
    process.env.BETTER_COMMIT_CURSOR_AUTO_APPROVE = "1";
    const result = await resolveCursorPermission("Write file", [
      { kind: "allow", name: "Allow always", optionId: "allow-always" },
      { kind: "reject", name: "Reject", optionId: "reject-once" },
    ]);
    expect(result).toBe("reject-once");
    process.env.BETTER_COMMIT_CURSOR_AUTO_APPROVE = originalEnv;
  });
});
