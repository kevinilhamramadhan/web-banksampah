// Agregasi analitik untuk dashboard ops. Skala komunitas (ratusan setoran) →
// hitung tren di memori; bila membengkak, ganti ke SQL date_trunc.
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
export interface AnalitikOps {
  totalPoinTerkumpul: number;
  totalRupiahDicairkan: number;
  totalSetoran: number;
  totalBeratKg: number;
  wargaAktif30Hari: number;
  tren: TrenBulan[];
  perJenis: JenisRingkas[];
}

function kunciBulan(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}
function labelBulan(d: Date) {
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

export async function analitikOps(sekarang = new Date()): Promise<AnalitikOps> {
  const awal6 = new Date(sekarang.getFullYear(), sekarang.getMonth() - 5, 1);
  const sejak30 = new Date(sekarang.getTime() - 30 * 86_400_000);

  const [agSetoran, agTukar, agBerat, perJenisRaw, wargaAktif, setoran6] = await Promise.all([
    prisma.setoran.aggregate({ _sum: { totalPoin: true }, _count: true }),
    prisma.penukaran.aggregate({ where: { status: "confirmed" }, _sum: { jumlahRupiah: true } }),
    prisma.setoranItem.aggregate({ _sum: { beratKg: true } }),
    prisma.setoranItem.groupBy({
      by: ["jenisSampahNama"],
      _sum: { beratKg: true, poin: true },
      orderBy: { _sum: { poin: "desc" } },
    }),
    prisma.setoran.findMany({ where: { tanggal: { gte: sejak30 } }, distinct: ["wargaId"], select: { wargaId: true } }),
    prisma.setoran.findMany({
      where: { tanggal: { gte: awal6 } },
      select: { tanggal: true, totalPoin: true, items: { select: { beratKg: true } } },
    }),
  ]);

  // Siapkan 6 keranjang bulan (lama → baru) lalu isi.
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

  return {
    totalPoinTerkumpul: agSetoran._sum.totalPoin ?? 0,
    totalRupiahDicairkan: agTukar._sum.jumlahRupiah ?? 0,
    totalSetoran: agSetoran._count,
    totalBeratKg: Math.round((agBerat._sum.beratKg ?? 0) * 100) / 100,
    wargaAktif30Hari: wargaAktif.length,
    tren: urutan.map((k) => keranjang.get(k)!),
    perJenis: perJenisRaw.map((r) => ({
      nama: r.jenisSampahNama,
      beratKg: Math.round((r._sum.beratKg ?? 0) * 100) / 100,
      poin: r._sum.poin ?? 0,
    })),
  };
}
