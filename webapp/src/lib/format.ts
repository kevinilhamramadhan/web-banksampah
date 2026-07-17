/** Detik tersisa sampai timestamp (dibulatkan ke atas, tidak pernah negatif). */
export function sisaDetik(sampai?: Date | null, sekarang: number = Date.now()): number {
  if (!sampai) return 0;
  return Math.max(0, Math.ceil((sampai.getTime() - sekarang) / 1000));
}

/** "16 Jul 2026, 18.30" — pakai locale Indonesia. */
export function fmtTanggal(d?: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
