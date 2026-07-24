// Peringkat penabung per kuartal kalender — agregat dari tabel Setoran.
// Hanya bertambah oleh setoran (penukaran tidak mengurangi), sama seperti
// leaderboard musiman di aplikasi Android lama.
import { prisma } from "./db";

export interface PeringkatBaris {
  wargaId: string;
  nama: string;
  poin: number;
  posisi: number;
}

export interface Peringkat {
  musimLabel: string;
  top: PeringkatBaris[];
  saya: PeringkatBaris | null;
}

export function kuartalRange(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3);
  return {
    mulai: new Date(d.getFullYear(), q * 3, 1),
    selesai: new Date(d.getFullYear(), q * 3 + 3, 1),
    label: `Kuartal ${q + 1} (${d.getFullYear()})`,
  };
}

export async function peringkatKuartal(uidSaya?: string): Promise<Peringkat> {
  const { mulai, selesai, label } = kuartalRange();
  const grup = await prisma.setoran.groupBy({
    by: ["wargaId"],
    where: { tanggal: { gte: mulai, lt: selesai } },
    _sum: { totalPoin: true },
    orderBy: { _sum: { totalPoin: "desc" } },
  });
  // ponytail: seluruh grup dimuat lalu diberi posisi di memori — skala komunitas ratusan warga;
  // kalau membengkak, ganti ke query ranking SQL.
  const users = await prisma.user.findMany({
    where: { id: { in: grup.map((g) => g.wargaId) } },
    select: { id: true, nama: true },
  });
  const namaMap = new Map(users.map((u) => [u.id, u.nama]));
  const semua: PeringkatBaris[] = grup.map((g, i) => ({
    wargaId: g.wargaId,
    nama: namaMap.get(g.wargaId) ?? "Warga",
    poin: g._sum.totalPoin ?? 0,
    posisi: i + 1,
  }));
  return {
    musimLabel: label,
    top: semua.slice(0, 10),
    saya: uidSaya ? (semua.find((s) => s.wargaId === uidSaya) ?? null) : null,
  };
}
