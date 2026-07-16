import { describe, expect, it } from "vitest";
import { shouldShowWelcome } from "./install";

describe("shouldShowWelcome", () => {
  it("tampil hanya saat belum memilih dan bukan standalone", () => {
    expect(shouldShowWelcome(false, null)).toBe(true);
    expect(shouldShowWelcome(false, "browser")).toBe(false);
    expect(shouldShowWelcome(false, "install")).toBe(false);
    expect(shouldShowWelcome(true, null)).toBe(false);
  });
});
