// Agregasi kontribusi satu warga: tren sampah per bulan + jenis favorit.
// Skala per-warga kecil → hitung tren di memori.
import { prisma } from "./db";

export interface TrenBulan {
  label: string;
  poin: number;
  beratKg: number;
}
export interface JenisRingkas {
  nama: string;
  beratKg: number;
  poin: number;
}
export interface KontribusiWarga {
  totalPoin: number;
  totalBeratKg: number;
  totalSetoran: number;
  jenisFavorit: string | null;
  tren: TrenBulan[];
  perJenis: JenisRingkas[];
}

function kunciBulan(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}
function labelBulan(d: Date) {
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

export async function kontribusiWarga(wargaId: string, sekarang = new Date()): Promise<KontribusiWarga> {
  const awal6 = new Date(sekarang.getFullYear(), sekarang.getMonth() - 5, 1);

  const [agSetoran, perJenisRaw, setoran6] = await Promise.all([
    prisma.setoran.aggregate({ where: { wargaId }, _sum: { totalPoin: true }, _count: true }),
    prisma.setoranItem.groupBy({
      by: ["jenisSampahNama"],
      where: { setoran: { wargaId } },
      _sum: { beratKg: true, poin: true },
      orderBy: { _sum: { beratKg: "desc" } },
    }),
    prisma.setoran.findMany({
      where: { wargaId, tanggal: { gte: awal6 } },
      select: { tanggal: true, totalPoin: true, items: { select: { beratKg: true } } },
    }),
  ]);

  const keranjang = new Map<string, TrenBulan>();
  const urutan: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - 5 + i, 1);
    const k = kunciBulan(d);
    urutan.push(k);
    keranjang.set(k, { label: labelBulan(d), poin: 0, beratKg: 0 });
  }
  for (const s of setoran6) {
    const b = keranjang.get(kunciBulan(s.tanggal));
    if (!b) continue;
    b.poin += s.totalPoin;
    b.beratKg += s.items.reduce((a, i) => a + i.beratKg, 0);
  }

  const perJenis = perJenisRaw.map((r) => ({
    nama: r.jenisSampahNama,
    beratKg: Math.round((r._sum.beratKg ?? 0) * 100) / 100,
    poin: r._sum.poin ?? 0,
  }));
  const totalBeratKg = Math.round(perJenis.reduce((a, j) => a + j.beratKg, 0) * 100) / 100;

  return {
    totalPoin: agSetoran._sum.totalPoin ?? 0,
    totalBeratKg,
    totalSetoran: agSetoran._count,
    jenisFavorit: perJenis[0]?.nama ?? null,
    tren: urutan.map((k) => keranjang.get(k)!),
    perJenis,
  };
}
