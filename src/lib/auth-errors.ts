// Pemetaan error Firebase Auth → pesan bahasa Indonesia yang ramah.
const PESAN: Record<string, string> = {
  "auth/email-already-in-use": "Email ini sudah terdaftar. Silakan login.",
  "auth/invalid-email": "Format email tidak valid.",
  "auth/weak-password": "Password terlalu lemah — minimal 6 karakter.",
  "auth/invalid-credential": "Email atau password salah.",
  "auth/wrong-password": "Email atau password salah.",
  "auth/user-not-found": "Email atau password salah.",
  "auth/user-disabled": "Akun ini dinonaktifkan. Hubungi pengelola bank sampah.",
  "auth/too-many-requests": "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
  "auth/network-request-failed": "Gagal terhubung. Periksa koneksi internet Anda.",
  "auth/missing-password": "Password belum diisi.",
};

export function pesanErrorAuth(e: unknown): string {
  const err = e as { code?: string; message?: string };
  if (err?.code && PESAN[err.code]) return PESAN[err.code];
  if (err?.message && !err.message.startsWith("Firebase:")) return err.message;
  return "Terjadi kesalahan. Coba lagi.";
}
