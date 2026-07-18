import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import { prisma } from "./db";

export const hashPassword = (pw: string) => argonHash(pw);

export async function verifyPassword(userId: string, pw: string): Promise<boolean> {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u?.passwordHash) return false;
  return argonVerify(u.passwordHash, pw);
}
