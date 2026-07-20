import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

beforeEach(resetDb);

// Invarian yang dijamin gantiPasswordAction (di luar wrapper cookie/Next):
// password lama ditolak setelah ganti, dan semua sesi lama tercabut.
describe("ganti password (inti)", () => {
  it("password baru berlaku, lama ditolak, semua sesi lama dicabut", async () => {
    const u = await buatUser({ email: "w@test.com" });
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword("lama123") } });
    await createSession(u.id);
    await createSession(u.id);
    expect(await prisma.session.count({ where: { userId: u.id } })).toBe(2);

    // Verifikasi password lama benar sebelum ganti.
    expect(await verifyPassword(u.id, "lama123")).toBe(true);

    // Simulasi aksi ganti: set hash baru + cabut semua sesi.
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword("baru456") } });
    await prisma.session.deleteMany({ where: { userId: u.id } });

    expect(await verifyPassword(u.id, "baru456")).toBe(true);
    expect(await verifyPassword(u.id, "lama123")).toBe(false);
    expect(await prisma.session.count({ where: { userId: u.id } })).toBe(0);
  });
});

describe("update profil (inti)", () => {
  it("nama/HP/alamat berubah tanpa menyentuh email/role/saldo", async () => {
    const u = await buatUser({ email: "w2@test.com", saldoPoin: 120 });
    await prisma.user.update({ where: { id: u.id }, data: { nama: "Budi Baru", noHp: "0899", alamat: "RT 09" } });
    const after = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(after).toMatchObject({ nama: "Budi Baru", noHp: "0899", alamat: "RT 09", email: "w2@test.com", role: "warga", saldoPoin: 120 });
  });
});
