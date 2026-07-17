import type { User } from "@prisma/client";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN } from "./constants";
import { prisma } from "./db";
import { PAGE_SIZE } from "./setoran";

export const TOKEN_UMUR_MENIT = 3;

export async function createPenukaran(ops: User, wargaId: string, poin: number) {
  if (ops.role !== "ops") throw new Error("Hanya ops yang boleh membuat penukaran");
  if (!Number.isInteger(poin) || poin < MIN_TUKAR_POIN) throw new Error(`Minimal penukaran ${MIN_TUKAR_POIN} poin`);
  const warga = await prisma.user.findUniqueOrThrow({ where: { id: wargaId } });
  if (poin > warga.saldoPoin) throw new Error(`Saldo warga hanya ${warga.saldoPoin} poin`);
  return prisma.penukaran.create({
    data: {
      wargaId, opsId: ops.id, poinDitukar: poin, jumlahRupiah: poin * RUPIAH_PER_POIN,
      tokenExpiredAt: new Date(Date.now() + TOKEN_UMUR_MENIT * 60_000),
    },
  });
}

export async function confirmPenukaran(warga: User, qrToken: string) {
  if (!warga.emailVerifiedAt) throw new Error("Verifikasi email dulu sebelum menukar poin");
  const p = await prisma.penukaran.findUnique({ where: { qrToken } });
  if (!p || p.wargaId !== warga.id) throw new Error("QR tidak valid atau bukan untuk akun Anda");
  if (p.status !== "pending") throw new Error("Penukaran ini sudah diproses. Minta ops membuat QR baru.");
  if (p.tokenExpiredAt < new Date()) throw new Error("QR sudah kedaluwarsa. Minta ops membuat ulang.");
  return prisma.$transaction(async (tx) => {
    // Guard atomik anti-replay: hanya satu transaksi yang lolos WHERE status='pending'.
    const { count } = await tx.penukaran.updateMany({
      where: { id: p.id, status: "pending" },
      data: { status: "confirmed", confirmedAt: new Date() },
    });
    if (count === 0) throw new Error("Penukaran ini sudah diproses. Minta ops membuat QR baru.");
    await tx.user.update({ where: { id: warga.id }, data: { saldoPoin: { decrement: p.poinDitukar } } });
    return tx.penukaran.findUniqueOrThrow({ where: { id: p.id } });
  });
}

export async function cancelPenukaran(ops: User, id: string) {
  if (ops.role !== "ops") throw new Error("Hanya ops");
  const { count } = await prisma.penukaran.updateMany({
    where: { id, status: "pending" }, data: { status: "cancelled" },
  });
  if (count === 0) throw new Error("Penukaran sudah tidak pending");
}

export const getPenukaran = (id: string) => prisma.penukaran.findUnique({ where: { id } });

export async function penukaranPage(by: "wargaId" | "opsId", id: string, cursor?: string) {
  const items = await prisma.penukaran.findMany({
    where: { [by]: id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  return { items, nextCursor: items.length === PAGE_SIZE ? items.at(-1)!.id : null };
}
