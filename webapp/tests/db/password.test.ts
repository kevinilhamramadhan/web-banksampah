import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { hashPassword, verifyAndUpgradePassword } from "@/lib/password";

beforeEach(resetDb);

describe("password", () => {
  it("hash argon2 terverifikasi; password salah ditolak", async () => {
    const u = await buatUser();
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword("rahasia123") } });
    expect(await verifyAndUpgradePassword(u.id, "rahasia123")).toBe(true);
    expect(await verifyAndUpgradePassword(u.id, "salah")).toBe(false);
  });
  it("hash Firebase lama terverifikasi lalu di-upgrade ke argon2", async () => {
    // Fixture dibuat dengan firebase-scrypt memakai param test (env FIREBASE_SCRYPT_* di .env)
    const { FirebaseScrypt } = await import("firebase-scrypt");
    const scrypt = new FirebaseScrypt({
      signerKey: process.env.FIREBASE_SCRYPT_SIGNER_KEY!,
      saltSeparator: process.env.FIREBASE_SCRYPT_SALT_SEPARATOR!,
      rounds: Number(process.env.FIREBASE_SCRYPT_ROUNDS),
      memCost: Number(process.env.FIREBASE_SCRYPT_MEM_COST),
    });
    const salt = Buffer.from("garam-tes").toString("base64");
    const hash = await scrypt.hash("passwordlama", salt);
    const u = await buatUser();
    await prisma.user.update({ where: { id: u.id }, data: { firebaseHash: hash, firebaseSalt: salt } });

    expect(await verifyAndUpgradePassword(u.id, "passwordlama")).toBe(true);
    const sesudah = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(sesudah.passwordHash).toBeTruthy();   // sudah argon2
    expect(sesudah.firebaseHash).toBeNull();     // hash lama dibuang
    expect(await verifyAndUpgradePassword(u.id, "passwordlama")).toBe(true); // jalur argon2
  });
});
