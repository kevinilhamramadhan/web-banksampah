import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { cancelPenukaran, confirmPenukaran, createPenukaran } from "@/lib/penukaran";

beforeEach(resetDb);
const siap = async () => ({
  ops: await buatUser({ role: "ops", email: "ops@test.com" }),
  warga: await buatUser({ saldoPoin: 58, emailVerifiedAt: new Date() }),
});

describe("penukaran", () => {
  it("alur lengkap: create pending → confirm → saldo berkurang persis; replay ditolak", async () => {
    const { ops, warga } = await siap();
    const p = await createPenukaran(ops, warga.id, 50);
    expect(p).toMatchObject({ status: "pending", jumlahRupiah: 10000 });
    const hasil = await confirmPenukaran(warga, p.qrToken);
    expect(hasil.status).toBe("confirmed");
    expect((await prisma.user.findUniqueOrThrow({ where: { id: warga.id } })).saldoPoin).toBe(8);
    await expect(confirmPenukaran(warga, p.qrToken)).rejects.toThrow(/sudah diproses/);
  });
  it("di bawah minimum dan melebihi saldo DITOLAK saat create", async () => {
    const { ops, warga } = await siap();
    await expect(createPenukaran(ops, warga.id, 10)).rejects.toThrow(/[Mm]inimal/);
    await expect(createPenukaran(ops, warga.id, 100)).rejects.toThrow(/saldo/i);
  });
  it("QR kedaluwarsa ditolak", async () => {
    const { ops, warga } = await siap();
    const p = await createPenukaran(ops, warga.id, 50);
    await prisma.penukaran.update({ where: { id: p.id }, data: { tokenExpiredAt: new Date(Date.now() - 1000) } });
    await expect(confirmPenukaran(warga, p.qrToken)).rejects.toThrow(/kedaluwarsa/);
  });
  it("warga belum verified ditolak; QR milik orang lain ditolak", async () => {
    const { ops } = await siap();
    const belum = await buatUser({ saldoPoin: 100, emailVerifiedAt: null, email: "wati@test.com" });
    const p = await createPenukaran(ops, belum.id, 50);
    await expect(confirmPenukaran(belum, p.qrToken)).rejects.toThrow(/[Vv]erifikasi/);
    const lain = await buatUser({ saldoPoin: 100, emailVerifiedAt: new Date(), email: "lain@test.com" });
    await expect(confirmPenukaran(lain, p.qrToken)).rejects.toThrow(/tidak valid/);
  });
  it("cancel hanya utk pending", async () => {
    const { ops, warga } = await siap();
    const p = await createPenukaran(ops, warga.id, 50);
    await cancelPenukaran(ops, p.id);
    expect((await prisma.penukaran.findUniqueOrThrow({ where: { id: p.id } })).status).toBe("cancelled");
    await expect(cancelPenukaran(ops, p.id)).rejects.toThrow();
  });
});
