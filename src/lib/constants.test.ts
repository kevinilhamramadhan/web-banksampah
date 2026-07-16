import { describe, expect, it } from "vitest";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN, TARIF_POIN_PER_KG, poinDari } from "./constants";

// Wajib identik dengan Android Repo.kt: (berat * 5).roundToLong()
describe("poinDari", () => {
  it("berat bulat", () => {
    expect(poinDari(1)).toBe(5);
    expect(poinDari(2)).toBe(10);
  });
  it("desimal dibulatkan seperti roundToLong Android", () => {
    expect(poinDari(1.5)).toBe(8); // 7.5 → 8
    expect(poinDari(1.4)).toBe(7); // 7.0
    expect(poinDari(0.1)).toBe(1); // 0.5 → 1
    expect(poinDari(0.09)).toBe(0);
  });
  it("hasil selalu integer (dituntut rules)", () => {
    expect(Number.isInteger(poinDari(1.23))).toBe(true);
  });
});

describe("parseBerat", () => {
  it("menerima koma desimal gaya Indonesia", async () => {
    const { parseBerat } = await import("./constants");
    expect(parseBerat("1,5")).toBe(1.5);
    expect(parseBerat("2.25")).toBe(2.25);
    expect(parseBerat("3")).toBe(3);
  });
  it("input tidak valid atau ≤ 0 → null", async () => {
    const { parseBerat } = await import("./constants");
    expect(parseBerat("abc")).toBeNull();
    expect(parseBerat("")).toBeNull();
    expect(parseBerat("0")).toBeNull();
    expect(parseBerat("-1")).toBeNull();
  });
});

describe("tarif", () => {
  it("konstanta sesuai kesepakatan", () => {
    expect(TARIF_POIN_PER_KG).toBe(5);
    expect(RUPIAH_PER_POIN).toBe(200);
    expect(MIN_TUKAR_POIN).toBe(50);
  });
});
