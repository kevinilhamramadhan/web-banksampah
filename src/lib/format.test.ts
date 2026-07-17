import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { fmtTanggal, sisaDetik } from "./format";

describe("sisaDetik", () => {
  it("hitung mundur dan tidak pernah negatif", () => {
    const t = Timestamp.fromMillis(10_000);
    expect(sisaDetik(t, 7_500)).toBe(3);
    expect(sisaDetik(t, 10_000)).toBe(0);
    expect(sisaDetik(t, 99_000)).toBe(0);
    expect(sisaDetik(null)).toBe(0);
  });
});

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
