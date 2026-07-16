import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { fmtTanggal } from "./format";

describe("fmtTanggal", () => {
  it("format Indonesia", () => {
    const t = Timestamp.fromDate(new Date(2026, 6, 16, 18, 30));
    expect(fmtTanggal(t)).toMatch(/16 Jul 2026/);
  });
  it("kosong → strip", () => {
    expect(fmtTanggal(null)).toBe("—");
    expect(fmtTanggal(undefined)).toBe("—");
  });
});
