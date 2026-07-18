// Aturan bisnis hardcode:
// 1 kg sampah = Rp 1.000 = 5 poin → 1 poin = Rp 200; pencairan minimal 50 poin.
export const TARIF_POIN_PER_KG = 5;
export const RUPIAH_PER_POIN = 200;
export const MIN_TUKAR_POIN = 50;

export const JENIS_SAMPAH = ["Plastik", "Logam", "Kardus", "Lainnya"];

/** Identik dengan Repo.kt: (berat * TARIF).roundToLong(). Rules menuntut poin integer. */
export function poinDari(beratKg: number): number {
  return Math.round(beratKg * TARIF_POIN_PER_KG);
}

/** "1,5" → 1.5; tidak valid atau ≤ 0 → null. */
export function parseBerat(s: string): number | null {
  const n = Number(s.trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function fmtRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}
