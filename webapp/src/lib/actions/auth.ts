"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { SESSION_COOKIE, SESSION_TTL_HARI, createSession, deleteSession } from "@/lib/session";
import { getSessionUser } from "@/lib/session-next";
import { sendVerification, sendReset, consumeEmailToken } from "@/lib/email";

async function pasangSession(userId: string) {
  const token = await createSession(userId);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_TTL_HARI * 86_400,
  });
}

export async function loginAction(fd: FormData): Promise<{ error?: string }> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !(await verifyPassword(u.id, password))) {
    return { error: "Email atau password salah." };
  }
  await pasangSession(u.id);
  redirect(u.role === "ops" ? "/ops" : "/warga");
}

export async function registerAction(fd: FormData): Promise<{ error?: string }> {
  const nama = String(fd.get("nama") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (nama.length < 1 || nama.length > 100) return { error: "Nama wajib diisi (maks. 100 huruf)." };
  if (password.length < 6) return { error: "Password minimal 6 karakter." };
  try {
    const u = await prisma.user.create({ data: {
      nama, email, noHp: String(fd.get("noHp") ?? "").trim(), alamat: String(fd.get("alamat") ?? "").trim(),
      passwordHash: await hashPassword(password), // role default warga, saldo default 0
    }});
    await sendVerification(u).catch(() => {}); // gagal kirim ≠ gagal daftar; ada tombol kirim ulang
    await pasangSession(u.id);
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { error: "Email ini sudah terdaftar. Silakan login." };
    throw e;
  }
  redirect("/warga");
}

export async function logoutAction(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export async function requestResetAction(fd: FormData): Promise<{ error?: string; info?: string }> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Isi email dulu." };
  const u = await prisma.user.findUnique({ where: { email } });
  // Tidak membocorkan apakah email terdaftar — pesan sama untuk keduanya.
  if (u) await sendReset(u).catch(() => {});
  return { info: "Jika email terdaftar, tautan reset password sudah dikirim. Cek kotak masuk (dan folder spam)." };
}

export async function resetPasswordAction(fd: FormData): Promise<{ error?: string; info?: string }> {
  const token = String(fd.get("token") ?? "");
  const password = String(fd.get("password") ?? "");
  if (password.length < 6) return { error: "Password minimal 6 karakter." };
  const u = await consumeEmailToken(token, "reset");
  if (!u) return { error: "Tautan reset tidak valid atau sudah kadaluarsa." };
  await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword(password) } });
  await prisma.session.deleteMany({ where: { userId: u.id } }); // cabut semua session lama
  return { info: "Password berhasil diubah. Silakan login." };
}

export async function resendVerificationAction(): Promise<{ error?: string; info?: string }> {
  const u = await getSessionUser();
  if (!u) return { error: "Anda belum login." };
  if (u.emailVerifiedAt) return { info: "Email Anda sudah terverifikasi." };
  const cooldown = await prisma.emailToken.findFirst({
    where: { userId: u.id, type: "verify", expiresAt: { gt: new Date(Date.now() + 59 * 60_000) } },
  });
  if (cooldown) return { error: "Tunggu 60 detik sebelum kirim ulang." };
  await sendVerification(u);
  return { info: "Email verifikasi terkirim. Cek kotak masuk (dan folder spam)." };
}

export async function verifyEmailAction(
  _prev: { ok?: boolean; error?: string },
  token: string,
): Promise<{ ok?: boolean; error?: string }> {
  const u = await consumeEmailToken(token, "verify");
  if (!u) return { error: "Tautan verifikasi tidak valid atau sudah kedaluwarsa." };
  return { ok: true };
}
