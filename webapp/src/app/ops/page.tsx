import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import { muatSetoranOpsAction } from "@/lib/actions/ops";
import { ringkasanBulanIni } from "@/lib/analitik";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN, fmtRupiah } from "@/lib/constants";
import { fmtTanggal } from "@/lib/format";
import AppHeader from "@/components/AppHeader";
import TombolKeluar from "@/components/TombolKeluar";

const IKON_SETOR = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 3v12m0-12-4 4m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15" strokeLinecap="round" />
  </svg>
);
const IKON_TUKAR = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="7" width="18" height="11" rx="2" />
    <circle cx="12" cy="12.5" r="2.6" />
  </svg>
);

export default async function OpsPage() {
  await requireRole("ops");
  const [setoranAwal, bulan] = await Promise.all([muatSetoranOpsAction(), ringkasanBulanIni()]);
  const terbaru = "error" in setoranAwal ? [] : setoranAwal.items.slice(0, 5);

  return (
    <>
      <AppHeader judul="Beranda" />
      <main className="container">
        {/* Dua tugas inti ops, langsung di depan. */}
        <div className="aksi-utama" style={{ padding: "10px 0" }}>
          <Link href="/ops/setoran" className="aksi-kartu utama">
            <span className="ikon">{IKON_SETOR}</span>
            <span>
              <span className="judul">Catat Setoran</span>
              <br />
              <span className="ket">Timbang sampah warga, poin otomatis</span>
            </span>
          </Link>
          <Link href="/ops/penukaran" className="aksi-kartu">
            <span className="ikon">{IKON_TUKAR}</span>
            <span>
              <span className="judul">Proses Penukaran</span>
              <br />
              <span className="ket">Buat QR pencairan poin</span>
            </span>
          </Link>
        </div>

        <p className="ringkas">
          Bulan ini <strong>{bulan.jumlahSetoran} setoran</strong>,{" "}
          <strong className="emas">{bulan.poin.toLocaleString("id-ID")} poin</strong>,{" "}
          <strong>{bulan.beratKg.toLocaleString("id-ID")} kg</strong>
        </p>
        <p className="muted" style={{ marginTop: 0 }}>
          Pencairan minimal {MIN_TUKAR_POIN} poin (= {fmtRupiah(MIN_TUKAR_POIN * RUPIAH_PER_POIN)}). Tarif
          poin per kg diatur per jenis sampah.
        </p>

        <div className="baris" style={{ marginTop: 24 }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Aktivitas terbaru</h2>
          <Link href="/ops/riwayat" className="tautan-sentuh">Lihat semua</Link>
        </div>

        {terbaru.length === 0 ? (
          <p className="muted">Belum ada setoran yang kamu proses. Mulai dari “Catat Setoran” di atas.</p>
        ) : (
          <div style={{ marginTop: 4 }}>
            {terbaru.map((s) => (
              <div key={s.id} className="riwayat-item baris" style={{ padding: "12px 0", borderBottom: "1px solid var(--garis)" }}>
                <div>
                  <strong>{s.wargaNama}</strong>
                  <br />
                  <span className="muted" style={{ fontSize: "0.85rem" }}>
                    {s.items.map((i) => `${i.jenisSampahNama} ${i.beratKg} kg`).join(", ")}, {fmtTanggal(new Date(s.tanggal))}
                  </span>
                </div>
                <strong style={{ color: "var(--hijau-link)" }}>+{s.totalPoin} poin</strong>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
