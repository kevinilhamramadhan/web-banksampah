"use server";
import { getSessionUser } from "@/lib/session-next";
import { prisma } from "@/lib/db";
import { parseBerat } from "@/lib/constants";
import { createSetoran, searchWarga, setoranPage } from "@/lib/setoran";
import { createPenukaran, cancelPenukaran, penukaranPage } from "@/lib/penukaran";

export interface RiwayatPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface WargaHasil {
  id: string;
  nama: string;
  noHp: string;
  saldoPoin: number;
}

/** Cari warga by nama / no HP untuk dipilih ops (dipakai WargaSearch, debounce di client). */
export async function cariWargaAction(q: string): Promise<WargaHasil[] | { error: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "ops") return { error: "Anda belum login sebagai ops." };
  return searchWarga(q);
}

export interface SimpanSetoranState {
  error?: string;
  sukses?: string;
}

/** Simpan satu setoran (server memvalidasi ulang berat via parseBerat+poinDari). */
export async function simpanSetoranAction(
  _prev: SimpanSetoranState,
  fd: FormData,
): Promise<SimpanSetoranState> {
  const user = await getSessionUser();
  if (!user || user.role !== "ops") return { error: "Anda belum login sebagai ops." };

  const wargaId = String(fd.get("wargaId") ?? "").trim();
  const jenis = String(fd.get("jenis") ?? "").trim();
  const beratTeks = String(fd.get("berat") ?? "").trim();

  if (!wargaId) return { error: "Pilih warga dulu." };
  if (!jenis) return { error: "Pilih jenis sampah." };
  const berat = parseBerat(beratTeks);
  if (berat === null) return { error: "Berat sampah tidak valid." };

  try {
    const hasil = await createSetoran(user, wargaId, [{ jenis, beratKg: berat }]);
    return { sukses: `Setoran ${jenis} ${beratTeks} kg (+${hasil.totalPoin} poin) tersimpan.` };
  } catch (e) {
    // Hanya error bisnis (plain Error) yang boleh diteruskan; error tak terduga dilempar ulang.
    if (e instanceof Error && e.constructor === Error) return { error: e.message };
    throw e;
  }
}

export interface PenukaranDTO {
  id: string;
  qrToken: string;
  poinDitukar: number;
  jumlahRupiah: number;
  wargaNama: string;
  tokenExpiredAt: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface BuatPenukaranState {
  data?: PenukaranDTO;
  error?: string;
}

/** Buat permintaan penukaran poin (QR) untuk warga terpilih. */
export async function buatPenukaranAction(
  _prev: BuatPenukaranState,
  fd: FormData,
): Promise<BuatPenukaranState> {
  const user = await getSessionUser();
  if (!user || user.role !== "ops") return { error: "Anda belum login sebagai ops." };

  const wargaId = String(fd.get("wargaId") ?? "").trim();
  const poinTeks = String(fd.get("poin") ?? "").trim();
  if (!wargaId) return { error: "Pilih warga dulu." };
  if (!/^\d+$/.test(poinTeks)) return { error: "Poin tidak valid." };
  const poin = Number(poinTeks);

  try {
    const p = await createPenukaran(user, wargaId, poin);
    const warga = await prisma.user.findUnique({ where: { id: wargaId }, select: { nama: true } });
    return {
      data: {
        id: p.id,
        qrToken: p.qrToken,
        poinDitukar: p.poinDitukar,
        jumlahRupiah: p.jumlahRupiah,
        wargaNama: warga?.nama ?? "",
        tokenExpiredAt: p.tokenExpiredAt.toISOString(),
        status: p.status,
      },
    };
  } catch (e) {
    if (e instanceof Error && e.constructor === Error) return { error: e.message };
    throw e;
  }
}

/** Batalkan penukaran yang masih pending. */
export async function batalkanPenukaranAction(id: string): Promise<{ ok: true } | { error: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "ops") return { error: "Anda belum login sebagai ops." };
  try {
    await cancelPenukaran(user, id);
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.constructor === Error) return { error: e.message };
    throw e;
  }
}

export interface SetoranOpsRingkas {
  id: string;
  wargaNama: string;
  tanggal: string;
  totalPoin: number;
  items: { jenisSampahNama: string; beratKg: number }[];
}

export interface PenukaranOpsRingkas {
  id: string;
  wargaNama: string;
  createdAt: string;
  status: "pending" | "confirmed" | "cancelled";
  poinDitukar: number;
  jumlahRupiah: number;
}

/** Halaman riwayat setoran yang diproses ops login (untuk "Muat lebih banyak"). */
export async function muatSetoranOpsAction(
  cursor?: string,
): Promise<RiwayatPage<SetoranOpsRingkas> | { error: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "ops") return { error: "Anda belum login sebagai ops." };
  const page = await setoranPage("opsId", user.id, cursor);
  const namaById = await petaNamaWarga(page.items.map((s) => s.wargaId));
  return {
    items: page.items.map((s) => ({
      id: s.id,
      wargaNama: namaById.get(s.wargaId) ?? "?",
      tanggal: s.tanggal.toISOString(),
      totalPoin: s.totalPoin,
      items: s.items.map((i) => ({ jenisSampahNama: i.jenisSampahNama, beratKg: i.beratKg })),
    })),
    nextCursor: page.nextCursor,
  };
}

/** Halaman riwayat penukaran yang diproses ops login (untuk "Muat lebih banyak"). */
export async function muatPenukaranOpsAction(
  cursor?: string,
): Promise<RiwayatPage<PenukaranOpsRingkas> | { error: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "ops") return { error: "Anda belum login sebagai ops." };
  const page = await penukaranPage("opsId", user.id, cursor);
  const namaById = await petaNamaWarga(page.items.map((p) => p.wargaId));
  return {
    items: page.items.map((p) => ({
      id: p.id,
      wargaNama: namaById.get(p.wargaId) ?? "?",
      createdAt: p.createdAt.toISOString(),
      status: p.status,
      poinDitukar: p.poinDitukar,
      jumlahRupiah: p.jumlahRupiah,
    })),
    nextCursor: page.nextCursor,
  };
}

async function petaNamaWarga(wargaIds: string[]): Promise<Map<string, string>> {
  const unik = [...new Set(wargaIds)];
  if (unik.length === 0) return new Map();
  const wargas = await prisma.user.findMany({ where: { id: { in: unik } }, select: { id: true, nama: true } });
  return new Map(wargas.map((w) => [w.id, w.nama]));
}
