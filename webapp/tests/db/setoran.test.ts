import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { createSetoran, searchWarga, setoranPage } from "@/lib/setoran";

beforeEach(resetDb);
const ops = () => buatUser({ role: "ops", email: "ops@test.com" });

describe("createSetoran", () => {
  it("atomik: dokumen + item + saldo bertambah persis (1,5 kg = 8 poin)", async () => {
    const o = await ops();
    const w = await buatUser();
    const { totalPoin } = await createSetoran(o, w.id, [{ jenis: "Plastik", beratKg: 1.5 }]);
    expect(totalPoin).toBe(8);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: w.id } })).saldoPoin).toBe(8);
    const s = await prisma.setoran.findFirstOrThrow({ include: { items: true } });
    expect(s.items[0]).toMatchObject({ jenisSampahId: "plastik", jenisSampahNama: "Plastik", beratKg: 1.5, poin: 8 });
  });
  it("warga tidak bisa jadi pelaku setoran", async () => {
    const w = await buatUser();
    await expect(createSetoran(w, w.id, [{ jenis: "Plastik", beratKg: 1 }])).rejects.toThrow(/ops/i);
  });
  it("penerima setoran harus warga (bukan ops)", async () => {
    const o = await buatUser({ role: "ops", email: "ops2@test.com" });
    const o2 = await buatUser({ role: "ops", email: "ops3@test.com" });
    await expect(createSetoran(o, o2.id, [{ jenis: "Plastik", beratKg: 1 }])).rejects.toThrow(/warga/);
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
    for (let i = 0; i < 25; i++) await createSetoran(o, w.id, [{ jenis: "Plastik", beratKg: 1 }]);
    const p1 = await setoranPage("wargaId", w.id);
    expect(p1.items).toHaveLength(20);
    expect(p1.nextCursor).toBeTruthy();
    const p2 = await setoranPage("wargaId", w.id, p1.nextCursor!);
    expect(p2.items).toHaveLength(5);
    expect(p2.nextCursor).toBeNull();
  });
});
