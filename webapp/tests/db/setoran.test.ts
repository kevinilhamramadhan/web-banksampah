import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, buatJenis, prisma, resetDb } from "./helpers";
import { createSetoran, searchWarga, setoranPage } from "@/lib/setoran";

beforeEach(resetDb);
const ops = () => buatUser({ role: "ops", email: "ops@test.com" });

describe("createSetoran", () => {
  it("atomik: dokumen + item + saldo bertambah persis (1,5 kg × 5 = 8 poin)", async () => {
    const o = await ops();
    const w = await buatUser();
    const j = await buatJenis({ nama: "Plastik", tarifPoinPerKg: 5 });
    const { totalPoin } = await createSetoran(o, w.id, [{ jenisId: j.id, beratKg: 1.5 }]);
    expect(totalPoin).toBe(8);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: w.id } })).saldoPoin).toBe(8);
    const s = await prisma.setoran.findFirstOrThrow({ include: { items: true } });
    expect(s.items[0]).toMatchObject({ jenisSampahId: j.id, jenisSampahNama: "Plastik", beratKg: 1.5, poin: 8 });
  });
  it("tarif per jenis dipakai (2 kg × 10 = 20 poin), diambil dari DB bukan input", async () => {
    const o = await ops();
    const w = await buatUser();
    const j = await buatJenis({ nama: "Logam", tarifPoinPerKg: 10 });
    const { totalPoin } = await createSetoran(o, w.id, [{ jenisId: j.id, beratKg: 2 }]);
    expect(totalPoin).toBe(20);
  });
  it("jenis nonaktif ditolak", async () => {
    const o = await ops();
    const w = await buatUser();
    const j = await buatJenis({ nama: "Kardus", aktif: false });
    await expect(createSetoran(o, w.id, [{ jenisId: j.id, beratKg: 1 }])).rejects.toThrow(/nonaktif/i);
  });
  it("jenis tak dikenal ditolak", async () => {
    const o = await ops();
    const w = await buatUser();
    await expect(createSetoran(o, w.id, [{ jenisId: "tidak-ada", beratKg: 1 }])).rejects.toThrow(/tidak ditemukan/i);
  });
  it("warga tidak bisa jadi pelaku setoran", async () => {
    const w = await buatUser();
    const j = await buatJenis();
    await expect(createSetoran(w, w.id, [{ jenisId: j.id, beratKg: 1 }])).rejects.toThrow(/ops/i);
  });
  it("penerima setoran harus warga (bukan ops)", async () => {
    const o = await buatUser({ role: "ops", email: "ops2@test.com" });
    const o2 = await buatUser({ role: "ops", email: "ops3@test.com" });
    const j = await buatJenis();
    await expect(createSetoran(o, o2.id, [{ jenisId: j.id, beratKg: 1 }])).rejects.toThrow(/warga/);
  });
});

describe("searchWarga", () => {
  it("prefix nama case-insensitive, prefix noHp, ops tersaring", async () => {
    await ops();
    const w = await buatUser({ email: "budi@test.com" });
    expect((await searchWarga("bud")).map((x) => x.id)).toContain(w.id);
    expect((await searchWarga("0812")).map((x) => x.id)).toContain(w.id);
    expect(await searchWarga("ops")).toHaveLength(0);
  });
});

describe("setoranPage", () => {
  it("20 per halaman + kursor lanjutan", async () => {
    const o = await ops();
    const w = await buatUser();
    const j = await buatJenis();
    for (let i = 0; i < 25; i++) await createSetoran(o, w.id, [{ jenisId: j.id, beratKg: 1 }]);
    const p1 = await setoranPage("wargaId", w.id);
    expect(p1.items).toHaveLength(20);
    expect(p1.nextCursor).toBeTruthy();
    const p2 = await setoranPage("wargaId", w.id, p1.nextCursor!);
    expect(p2.items).toHaveLength(5);
    expect(p2.nextCursor).toBeNull();
  });
});
