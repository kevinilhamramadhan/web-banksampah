import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, buatJenis, resetDb } from "./helpers";
import { createSetoran } from "@/lib/setoran";
import { kontribusiWarga } from "@/lib/kontribusi";

beforeEach(resetDb);

describe("kontribusiWarga", () => {
  it("total, jenis favorit (berat terbanyak), per-jenis, dan tren scoped ke warga", async () => {
    const ops = await buatUser({ role: "ops", email: "ops@test.com" });
    const a = await buatUser({ email: "a@test.com" });
    const lain = await buatUser({ email: "lain@test.com" });
    const plastik = await buatJenis({ nama: "Plastik", tarifPoinPerKg: 5 });
    const logam = await buatJenis({ nama: "Logam", tarifPoinPerKg: 10 });

    // Warga a: Plastik 2kg (10 poin) + Logam 5kg (50 poin) → berat 7, poin 60.
    await createSetoran(ops, a.id, [{ jenisId: plastik.id, beratKg: 2 }]);
    await createSetoran(ops, a.id, [{ jenisId: logam.id, beratKg: 5 }]);
    // Warga lain — tidak boleh ikut terhitung.
    await createSetoran(ops, lain.id, [{ jenisId: plastik.id, beratKg: 9 }]);

    const k = await kontribusiWarga(a.id);
    expect(k.totalPoin).toBe(60);
    expect(k.totalBeratKg).toBe(7);
    expect(k.totalSetoran).toBe(2);
    // Favorit = berat terbanyak → Logam (5kg > 2kg).
    expect(k.jenisFavorit).toBe("Logam");
    expect(k.perJenis.map((j) => [j.nama, j.beratKg, j.poin])).toEqual([
      ["Logam", 5, 50],
      ["Plastik", 2, 10],
    ]);
    expect(k.tren).toHaveLength(6);
    expect(k.tren.at(-1)!.beratKg).toBe(7);
    expect(k.tren.at(-1)!.poin).toBe(60);
  });

  it("warga tanpa setoran → nol & favorit null, tren tetap 6 bulan", async () => {
    const w = await buatUser();
    const k = await kontribusiWarga(w.id);
    expect(k.totalPoin).toBe(0);
    expect(k.totalSetoran).toBe(0);
    expect(k.jenisFavorit).toBeNull();
    expect(k.perJenis).toEqual([]);
    expect(k.tren).toHaveLength(6);
  });
});
