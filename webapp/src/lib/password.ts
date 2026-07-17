import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import { FirebaseScrypt } from "firebase-scrypt";
import { prisma } from "./db";

export const hashPassword = (pw: string) => argonHash(pw);

const scrypt = () =>
  new FirebaseScrypt({
    signerKey: process.env.FIREBASE_SCRYPT_SIGNER_KEY!,
    saltSeparator: process.env.FIREBASE_SCRYPT_SALT_SEPARATOR!,
    rounds: Number(process.env.FIREBASE_SCRYPT_ROUNDS),
    memCost: Number(process.env.FIREBASE_SCRYPT_MEM_COST),
  });

export async function verifyAndUpgradePassword(userId: string, pw: string): Promise<boolean> {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return false;
  if (u.passwordHash) return argonVerify(u.passwordHash, pw);
  if (u.firebaseHash && u.firebaseSalt) {
    const ok = await scrypt().verify(pw, u.firebaseSalt, u.firebaseHash);
    if (ok) {
      // Upgrade transparan: warga tidak sadar ada migrasi.
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: await hashPassword(pw), firebaseHash: null, firebaseSalt: null },
      });
    }
    return ok;
  }
  return false;
}
