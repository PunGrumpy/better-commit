import { describe, expect, test } from "bun:test";

import {
  isPermissionRejection,
  mapPermissionOptionsToSelect,
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
