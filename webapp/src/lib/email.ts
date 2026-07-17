import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import type { TokenType, User } from "@prisma/client";
import { prisma } from "./db";

export async function createEmailToken(userId: string, type: TokenType): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.emailToken.create({
    data: { token, userId, type, expiresAt: new Date(Date.now() + 3_600_000) },
  });
  return token;
}

export async function consumeEmailToken(token: string, type: TokenType): Promise<User | null> {
  const t = await prisma.emailToken.findUnique({ where: { token }, include: { user: true } });
  if (!t || t.type !== type || t.expiresAt < new Date()) return null;
  await prisma.emailToken.delete({ where: { token } }); // sekali pakai
  if (type === "verify") {
    return prisma.user.update({ where: { id: t.userId }, data: { emailVerifiedAt: new Date() } });
  }
  return t.user;
}

const resend = () => new Resend(process.env.RESEND_API_KEY);
const kirim = (to: string, subject: string, html: string) =>
  resend().emails.send({ from: process.env.EMAIL_FROM!, to, subject, html });

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendVerification(user: User) {
  const t = await createEmailToken(user.id, "verify");
  await kirim(user.email, "Verifikasi email Bank Sampah",
    `<p>Halo ${esc(user.nama)}, klik untuk verifikasi: <a href="${process.env.APP_URL}/verifikasi?token=${encodeURIComponent(t)}">Verifikasi Email</a> (berlaku 1 jam)</p>`);
}
export async function sendReset(user: User) {
  const t = await createEmailToken(user.id, "reset");
  await kirim(user.email, "Reset password Bank Sampah",
    `<p>Halo ${esc(user.nama)}, klik untuk reset password: <a href="${process.env.APP_URL}/reset?token=${encodeURIComponent(t)}">Reset Password</a> (berlaku 1 jam)</p>`);
}
