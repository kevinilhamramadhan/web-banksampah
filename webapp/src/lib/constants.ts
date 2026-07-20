// Aturan bisnis:
// 1 kg = Rp 1.000 = 5 poin (tarif default) → 1 poin = Rp 200; pencairan minimal 50 poin.
// Tarif per jenis kini disimpan di tabel JenisSampah (lihat lib/jenis-sampah.ts);
// TARIF_POIN_PER_KG hanya default/fallback & nilai seed awal.
export const TARIF_POIN_PER_KG = 5;
export const RUPIAH_PER_POIN = 200;
export const MIN_TUKAR_POIN = 50;

// Daftar seed jenis sampah awal (dipakai saat menyiapkan DB; sumber kebenaran = tabel JenisSampah).
export const JENIS_SAMPAH = ["Plastik", "Logam", "Kardus", "Lainnya"];

/** Poin = round(berat * tarif). Tarif default TARIF_POIN_PER_KG bila tak diberikan. */
export function poinDari(beratKg: number, tarifPoinPerKg: number = TARIF_POIN_PER_KG): number {
  return Math.round(beratKg * tarifPoinPerKg);
}

/** "1,5" → 1.5; tidak valid atau ≤ 0 → null. */
export function parseBerat(s: string): number | null {
  const n = Number(s.trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function fmtRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}
