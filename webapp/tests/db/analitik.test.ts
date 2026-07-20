import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, buatJenis, resetDb } from "./helpers";
import { createSetoran } from "@/lib/setoran";
import { createPenukaran, confirmPenukaran } from "@/lib/penukaran";
import { analitikOps } from "@/lib/analitik";

beforeEach(resetDb);

describe("analitikOps", () => {
  it("agregat total, warga aktif, per-jenis, dan tren bulan berjalan", async () => {
    const ops = await buatUser({ role: "ops", email: "ops@test.com" });
    const a = await buatUser({ email: "a@test.com", emailVerifiedAt: new Date() });
    const b = await buatUser({ email: "b@test.com" });
    const plastik = await buatJenis({ nama: "Plastik", tarifPoinPerKg: 5 });
    const logam = await buatJenis({ nama: "Logam", tarifPoinPerKg: 10 });

    await createSetoran(ops, a.id, [{ jenisId: plastik.id, beratKg: 2 }]); // 10 poin, 2kg
    await createSetoran(ops, a.id, [{ jenisId: logam.id, beratKg: 5 }]); // 50 poin, 5kg → a: 60 poin
    await createSetoran(ops, b.id, [{ jenisId: logam.id, beratKg: 1 }]); // 10 poin, 1kg

    // a menukar 50 poin (dikonfirmasi warga a yang emailnya terverifikasi).
    const p = await createPenukaran(ops, a.id, 50);
    await confirmPenukaran(a, p.qrToken);

    const hasil = await analitikOps();
    expect(hasil.totalPoinTerkumpul).toBe(70);
    expect(hasil.totalSetoran).toBe(3);
    expect(hasil.totalBeratKg).toBe(8);
    expect(hasil.wargaAktif30Hari).toBe(2);
    expect(hasil.totalRupiahDicairkan).toBe(50 * 200);

    // Per-jenis diurut poin desc: Logam 60 (50+10) di atas Plastik 10.
    expect(hasil.perJenis.map((j) => [j.nama, j.beratKg, j.poin])).toEqual([
      ["Logam", 6, 60],
      ["Plastik", 2, 10],
    ]);

    // Tren = 6 bulan; bulan terakhir memuat semua poin & berat.
    expect(hasil.tren).toHaveLength(6);
    expect(hasil.tren.at(-1)!.poin).toBe(70);
    expect(hasil.tren.at(-1)!.beratKg).toBe(8);
  });

  it("DB kosong → nol semua, tren tetap 6 bulan", async () => {
    const hasil = await analitikOps();
    expect(hasil.totalPoinTerkumpul).toBe(0);
    expect(hasil.totalRupiahDicairkan).toBe(0);
    expect(hasil.wargaAktif30Hari).toBe(0);
    expect(hasil.perJenis).toEqual([]);
    expect(hasil.tren).toHaveLength(6);
  });
});
