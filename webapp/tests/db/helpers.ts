import "dotenv/config";
// Prisma membaca DATABASE_URL secara lazy (baru dipakai saat query pertama dijalankan),
// jadi override env di sini — sebelum @/lib/db diimpor — sudah cukup untuk mengalihkan
// PrismaClient ke database test tanpa perlu instance client terpisah.
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST!;
import { prisma } from "../../src/lib/db";
export { prisma };
export async function resetDb() {
  const [{ db }] = await prisma.$queryRaw<{ db: string }[]>`SELECT current_database() AS db`;
  if (!db.includes("test")) throw new Error("resetDb menolak: bukan database test");
  await prisma.$executeRawUnsafe(
    `TRUNCATE "Penukaran","SetoranItem","Setoran","EmailToken","Session","User" CASCADE`);
}
export function buatUser(over: Partial<{ role: "warga" | "ops"; email: string; saldoPoin: number; emailVerifiedAt: Date | null }> = {}) {
  return prisma.user.create({ data: {
    role: over.role ?? "warga", nama: "Budi Warga", noHp: "0812345678", alamat: "RT 01",
    email: over.email ?? `u${crypto.randomUUID()}@test.com`,
    saldoPoin: over.saldoPoin ?? 0, emailVerifiedAt: over.emailVerifiedAt ?? null,
  }});
}
