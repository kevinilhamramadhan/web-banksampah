import "dotenv/config";
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST!;
import { prisma } from "../../src/lib/db";
export { prisma };
export async function resetDb() {
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
