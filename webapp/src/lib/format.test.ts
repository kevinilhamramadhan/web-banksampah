import { describe, expect, it } from "vitest";
import { fmtTanggal, sisaDetik } from "./format";

describe("sisaDetik", () => {
  it("hitung mundur dan tidak pernah negatif", () => {
    const d = new Date(10_000);
    expect(sisaDetik(d, 7_500)).toBe(3);
    expect(sisaDetik(d, 10_000)).toBe(0);
    expect(sisaDetik(d, 99_000)).toBe(0);
    expect(sisaDetik(null)).toBe(0);
  });
});

describe("fmtTanggal", () => {
  it("format Indonesia", () => {
    const d = new Date(2026, 6, 16, 18, 30);
    expect(fmtTanggal(d)).toMatch(/16 Jul 2026/);
  });
  it("kosong → strip", () => {
    expect(fmtTanggal(null)).toBe("—");
    expect(fmtTanggal(undefined)).toBe("—");
  });
});
