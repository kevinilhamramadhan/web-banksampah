import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { createSetoran } from "@/lib/setoran";
import { kuartalRange, peringkatKuartal } from "@/lib/peringkat";

beforeEach(resetDb);

describe("kuartalRange", () => {
  it("kuartal kalender + label Indonesia", () => {
    const feb = kuartalRange(new Date(2026, 1, 10));
    expect(feb.label).toBe("Kuartal 1 · 2026");
    expect(feb.mulai.getMonth()).toBe(0);
    expect(feb.selesai.getMonth()).toBe(3);
    const nov = kuartalRange(new Date(2026, 10, 2));
    expect(nov.label).toBe("Kuartal 4 · 2026");
  });
});

describe("peringkatKuartal", () => {
  it("urut total poin kuartal berjalan; setoran kuartal lain tidak dihitung; posisi saya benar", async () => {
    const ops = await buatUser({ role: "ops", email: "ops@test.com" });
    const a = await buatUser({ email: "a@test.com" });
    const b = await buatUser({ email: "b@test.com" });
    const c = await buatUser({ email: "c@test.com" });

    await createSetoran(ops, a.id, [{ jenis: "Plastik", beratKg: 2 }]); // 10 poin
    await createSetoran(ops, b.id, [{ jenis: "Kardus", beratKg: 10 }]); // 50 poin
    await createSetoran(ops, b.id, [{ jenis: "Logam", beratKg: 1 }]); // +5 → 55
    await createSetoran(ops, c.id, [{ jenis: "Plastik", beratKg: 1 }]); // 5 poin
    // Setoran kuartal LALU utk a — tidak boleh terhitung.
    await prisma.setoran.create({
      data: { wargaId: a.id, opsId: ops.id, totalPoin: 999, tanggal: new Date(2020, 0, 1) },
    });

    const hasil = await peringkatKuartal(c.id);
    expect(hasil.top.map((t) => [t.nama !== "", t.poin, t.posisi])).toEqual([
      [true, 55, 1],
      [true, 10, 2],
      [true, 5, 3],
    ]);
    expect(hasil.top[0].wargaId).toBe(b.id);
    expect(hasil.saya).toMatchObject({ wargaId: c.id, poin: 5, posisi: 3 });
  });

  it("kuartal kosong → daftar kosong, saya null", async () => {
    const w = await buatUser();
    const hasil = await peringkatKuartal(w.id);
    expect(hasil.top).toEqual([]);
    expect(hasil.saya).toBeNull();
  });
});
