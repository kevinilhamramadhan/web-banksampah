// Aturan bisnis hardcode — samakan dengan Android (Repo.kt) & firestore.rules:
// 1 kg sampah = Rp 1.000 = 5 poin → 1 poin = Rp 200; pencairan minimal 50 poin.
export const TARIF_POIN_PER_KG = 5;
export const RUPIAH_PER_POIN = 200;
export const MIN_TUKAR_POIN = 50;

export const JENIS_SAMPAH = ["Plastik", "Logam", "Kardus", "Lainnya"];

/** Identik dengan Repo.kt: (berat * TARIF).roundToLong(). Rules menuntut poin integer. */
export function poinDari(beratKg: number): number {
  return Math.round(beratKg * TARIF_POIN_PER_KG);
}

export function fmtRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

/** Musim leaderboard = kuartal kalender, identik Android: "2026-Q3". */
export function currentSeason(d = new Date()): string {
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}
