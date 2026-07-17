import { randomBytes } from "node:crypto";
import { prisma } from "./db";

export const SESSION_COOKIE = "bs_session";
export const SESSION_TTL_HARI = 30;

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: { token, userId, expiresAt: new Date(Date.now() + SESSION_TTL_HARI * 86_400_000) },
  });
  return token;
}

export async function getUserByToken(token: string) {
  const s = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!s) return null;
  if (s.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return s.user;
}

export const deleteSession = (token: string) =>
  prisma.session.deleteMany({ where: { token } }).then(() => {});
