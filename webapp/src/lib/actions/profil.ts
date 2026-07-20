"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session-next";
import { hashPassword, verifyPassword } from "@/lib/password";
import { SESSION_COOKIE, SESSION_TTL_HARI, createSession } from "@/lib/session";

export interface ProfilState {
  error?: string;
  sukses?: string;
}

/** Ubah data diri (nama/HP/alamat). Email tidak diubah di sini. */
export async function updateProfilAction(_prev: ProfilState, fd: FormData): Promise<ProfilState> {
  const u = await getSessionUser();
  if (!u) return { error: "Anda belum login." };

  const nama = String(fd.get("nama") ?? "").trim();
  const noHp = String(fd.get("noHp") ?? "").trim();
  const alamat = String(fd.get("alamat") ?? "").trim();
  if (nama.length < 1 || nama.length > 100) return { error: "Nama wajib diisi (maks. 100 huruf)." };
  if (!noHp) return { error: "No. HP wajib diisi." };
  if (!alamat) return { error: "Alamat wajib diisi." };

  await prisma.user.update({ where: { id: u.id }, data: { nama, noHp, alamat } });
  revalidatePath("/warga/profil");
  return { sukses: "Profil diperbarui." };
}

/** Ganti password: verifikasi password lama, set baru, keluarkan semua perangkat lain. */
export async function gantiPasswordAction(_prev: ProfilState, fd: FormData): Promise<ProfilState> {
  const u = await getSessionUser();
  if (!u) return { error: "Anda belum login." };

  const lama = String(fd.get("lama") ?? "");
  const baru = String(fd.get("baru") ?? "");
  if (baru.length < 6) return { error: "Password baru minimal 6 karakter." };
  if (!(await verifyPassword(u.id, lama))) return { error: "Password lama salah." };

  await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword(baru) } });
  // Cabut semua sesi (semua perangkat), lalu pasang sesi baru untuk perangkat ini.
  await prisma.session.deleteMany({ where: { userId: u.id } });
  const token = await createSession(u.id);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_HARI * 86_400,
  });
  return { sukses: "Password berhasil diganti. Perangkat lain telah dikeluarkan." };
}
