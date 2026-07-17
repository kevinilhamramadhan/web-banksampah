import type { Timestamp } from "firebase/firestore";

/** Detik tersisa sampai timestamp (dibulatkan ke atas, tidak pernah negatif). */
export function sisaDetik(sampai?: Timestamp | null, sekarang: number = Date.now()): number {
  if (!sampai) return 0;
  return Math.max(0, Math.ceil((sampai.toMillis() - sekarang) / 1000));
}

/** "16 Jul 2026, 18.30" — pakai locale Indonesia. */
export function fmtTanggal(ts?: Timestamp | null): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
