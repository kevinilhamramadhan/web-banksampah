import { getSessionUser } from "@/lib/session-next";
import { prisma } from "@/lib/db";
import { keCsv, type SelCsv } from "@/lib/csv";

// Ekspor rekap setoran/penukaran per periode sebagai CSV untuk LPJ ke desa.
// Node runtime (default) — menyentuh Prisma.

function parseTanggal(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
function tgl(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function slug(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

const STATUS: Record<string, string> = {
  pending: "Menunggu",
  confirmed: "Berhasil",
  cancelled: "Dibatalkan",
};

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ops") {
    return new Response("Akses ditolak.", { status: 403 });
  }

  const url = new URL(req.url);
  const jenis = url.searchParams.get("jenis") === "penukaran" ? "penukaran" : "setoran";
  const dari = parseTanggal(url.searchParams.get("dari")) ?? new Date(0);
  const sampaiInput = parseTanggal(url.searchParams.get("sampai")) ?? new Date();
  const sampaiEks = new Date(sampaiInput.getTime() + 86_400_000); // inklusif sampai akhir hari

  let csv: string;
  let namaFile: string;

  if (jenis === "setoran") {
    const rows = await prisma.setoran.findMany({
      where: { tanggal: { gte: dari, lt: sampaiEks } },
      orderBy: { tanggal: "asc" },
      include: { warga: { select: { nama: true } }, items: true },
    });
    const baris: SelCsv[][] = [];
    for (const s of rows) {
      for (const it of s.items) {
        baris.push([tgl(s.tanggal), s.warga.nama, it.jenisSampahNama, it.beratKg, it.poin]);
      }
    }
    csv = keCsv(["Tanggal", "Warga", "Jenis Sampah", "Berat (kg)", "Poin"], baris);
    namaFile = `setoran-${slug(dari)}-${slug(sampaiInput)}.csv`;
  } else {
    const rows = await prisma.penukaran.findMany({
      where: { createdAt: { gte: dari, lt: sampaiEks } },
      orderBy: { createdAt: "asc" },
      include: { warga: { select: { nama: true } } },
    });
    const baris: SelCsv[][] = rows.map((p) => [
      tgl(p.createdAt),
      p.warga.nama,
      STATUS[p.status] ?? p.status,
      p.poinDitukar,
      p.jumlahRupiah,
    ]);
    csv = keCsv(["Tanggal", "Warga", "Status", "Poin", "Rupiah"], baris);
    namaFile = `penukaran-${slug(dari)}-${slug(sampaiInput)}.csv`;
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${namaFile}"`,
      "Cache-Control": "no-store",
    },
  });
}
