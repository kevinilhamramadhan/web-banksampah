"use server";
import { getSessionUser } from "@/lib/session-next";
import { setoranPage } from "@/lib/setoran";
import { penukaranPage, confirmPenukaran } from "@/lib/penukaran";

export interface SetoranRingkas {
  id: string;
  tanggal: string;
  totalPoin: number;
  items: { jenisSampahNama: string; beratKg: number }[];
}

export interface PenukaranRingkas {
  id: string;
  createdAt: string;
  status: "pending" | "confirmed" | "cancelled";
  poinDitukar: number;
  jumlahRupiah: number;
}

export interface RiwayatPage<T> {
  items: T[];
  nextCursor: string | null;
}

/** Konfirmasi penukaran dari hasil scan QR. Hanya untuk warga login. */
export async function confirmScanAction(
  _prev: unknown,
  qrToken: string,
): Promise<{ ok: true; poin: number; rupiah: number } | { error: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "warga") return { error: "Anda belum login." };
  try {
    const p = await confirmPenukaran(user, qrToken);
    return { ok: true, poin: p.poinDitukar, rupiah: p.jumlahRupiah };
  } catch (e) {
    // Hanya error bisnis (plain Error dari confirmPenukaran) yang boleh diteruskan;
    // error tak terduga (Prisma/infra) dilempar ulang agar diredam Next.js.
    if (e instanceof Error && e.constructor === Error) return { error: e.message };
    throw e;
  }
}

/** Halaman riwayat setoran milik warga login (untuk "Muat lebih banyak"). */
export async function muatSetoranAction(
  cursor?: string,
): Promise<RiwayatPage<SetoranRingkas> | { error: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "warga") return { error: "Anda belum login." };
  const page = await setoranPage("wargaId", user.id, cursor);
  return {
    items: page.items.map((s) => ({
      id: s.id,
      tanggal: s.tanggal.toISOString(),
      totalPoin: s.totalPoin,
      items: s.items.map((i) => ({ jenisSampahNama: i.jenisSampahNama, beratKg: i.beratKg })),
    })),
    nextCursor: page.nextCursor,
  };
}

/** Halaman riwayat penukaran milik warga login (untuk "Muat lebih banyak"). */
export async function muatPenukaranAction(
  cursor?: string,
): Promise<RiwayatPage<PenukaranRingkas> | { error: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "warga") return { error: "Anda belum login." };
  const page = await penukaranPage("wargaId", user.id, cursor);
  return {
    items: page.items.map((p) => ({
      id: p.id,
      createdAt: p.createdAt.toISOString(),
      status: p.status,
      poinDitukar: p.poinDitukar,
      jumlahRupiah: p.jumlahRupiah,
    })),
    nextCursor: page.nextCursor,
  };
}
