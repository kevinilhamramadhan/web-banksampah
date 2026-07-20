// Master jenis sampah & tarif — sumber kebenaran untuk form setoran & perhitungan poin.
import { prisma } from "./db";

/** Daftar jenis sampah. aktifSaja=true untuk form setoran; false untuk halaman kelola. */
export function listJenisSampah(aktifSaja = true) {
  return prisma.jenisSampah.findMany({
    where: aktifSaja ? { aktif: true } : undefined,
    orderBy: [{ urutan: "asc" }, { nama: "asc" }],
  });
}

function validasi(nama: string, tarif: number) {
  const n = nama.trim();
  if (!n) throw new Error("Nama jenis sampah wajib diisi.");
  if (n.length > 40) throw new Error("Nama jenis sampah terlalu panjang.");
  if (!Number.isInteger(tarif) || tarif <= 0) throw new Error("Tarif harus bilangan bulat lebih dari 0.");
  return n;
}

/** Tambah jenis baru; nama unik (P2002 kalau kembar) — ditaruh di urutan terakhir. */
export async function createJenis(nama: string, tarifPoinPerKg: number) {
  const n = validasi(nama, tarifPoinPerKg);
  const maks = await prisma.jenisSampah.aggregate({ _max: { urutan: true } });
  return prisma.jenisSampah.create({
    data: { nama: n, tarifPoinPerKg, urutan: (maks._max.urutan ?? -1) + 1 },
  });
}

/** Ubah tarif satu jenis. */
export async function updateTarif(id: string, tarifPoinPerKg: number) {
  if (!Number.isInteger(tarifPoinPerKg) || tarifPoinPerKg <= 0)
    throw new Error("Tarif harus bilangan bulat lebih dari 0.");
  return prisma.jenisSampah.update({ where: { id }, data: { tarifPoinPerKg } });
}

/** Aktif/nonaktifkan jenis (nonaktif = tak muncul di form setoran, tapi riwayat tetap utuh). */
export async function toggleJenis(id: string) {
  const j = await prisma.jenisSampah.findUnique({ where: { id }, select: { aktif: true } });
  if (!j) throw new Error("Jenis sampah tidak ditemukan.");
  return prisma.jenisSampah.update({ where: { id }, data: { aktif: !j.aktif } });
}
