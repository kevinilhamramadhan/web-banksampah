import type { User } from "@prisma/client";
import { poinDari } from "./constants";
import { prisma } from "./db";

export const PAGE_SIZE = 20;
export interface Page<T> { items: T[]; nextCursor: string | null }

export async function createSetoran(ops: User, wargaId: string, entri: { jenisId: string; beratKg: number }[]) {
  if (ops.role !== "ops") throw new Error("Hanya ops yang boleh mencatat setoran");
  if (entri.length === 0) throw new Error("Minimal satu jenis sampah");
  if (entri.some((e) => e.beratKg <= 0)) throw new Error("Berat harus > 0");
  const hasil = await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { id: wargaId }, select: { role: true } });
    if (target?.role !== "warga") throw new Error("Penerima setoran harus warga");
    // Tarif & nama diambil dari DB (otoritatif) — bukan dari input client.
    const idUnik = [...new Set(entri.map((e) => e.jenisId))];
    const jenisRows = await tx.jenisSampah.findMany({ where: { id: { in: idUnik } } });
    const petaJenis = new Map(jenisRows.map((j) => [j.id, j]));
    const items = entri.map((e) => {
      const j = petaJenis.get(e.jenisId);
      if (!j) throw new Error("Jenis sampah tidak ditemukan");
      if (!j.aktif) throw new Error(`Jenis sampah "${j.nama}" sedang nonaktif`);
      return {
        jenisSampahId: j.id, jenisSampahNama: j.nama,
        beratKg: e.beratKg, poin: poinDari(e.beratKg, j.tarifPoinPerKg),
      };
    });
    const totalPoin = items.reduce((a, i) => a + i.poin, 0);
    const s = await tx.setoran.create({ data: { wargaId, opsId: ops.id, totalPoin, items: { create: items } } });
    await tx.user.update({ where: { id: wargaId }, data: { saldoPoin: { increment: totalPoin } } });
    return { id: s.id, totalPoin, rincian: items.map((i) => ({ nama: i.jenisSampahNama, poin: i.poin })) };
  });
  return hasil;
}

export function searchWarga(q: string) {
  const t = q.trim();
  if (!t) return Promise.resolve([]);
  return prisma.user.findMany({
    where: { role: "warga", OR: [{ nama: { startsWith: t, mode: "insensitive" } }, { noHp: { startsWith: t } }] },
    select: { id: true, nama: true, noHp: true, saldoPoin: true },
    orderBy: { nama: "asc" }, take: 12,
  });
}

export async function setoranPage(by: "wargaId" | "opsId", id: string, cursor?: string) {
  const items = await prisma.setoran.findMany({
    where: { [by]: id }, include: { items: true },
    orderBy: [{ tanggal: "desc" }, { id: "desc" }],
    take: PAGE_SIZE, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  return { items, nextCursor: items.length === PAGE_SIZE ? items.at(-1)!.id : null };
}
