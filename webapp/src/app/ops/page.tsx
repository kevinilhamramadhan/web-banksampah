import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import { muatSetoranOpsAction, muatPenukaranOpsAction } from "@/lib/actions/ops";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN, fmtRupiah } from "@/lib/constants";
import AppHeader from "@/components/AppHeader";
import TombolKeluar from "@/components/TombolKeluar";
import RiwayatList from "@/components/RiwayatList";

export default async function OpsPage() {
  await requireRole("ops");
  const setoranAwal = await muatSetoranOpsAction();
  const initialSetoran = "error" in setoranAwal ? { items: [], nextCursor: null } : setoranAwal;

  return (
    <>
      <AppHeader judul="Ops Bank Sampah" aksi={<TombolKeluar />} />
      <main className="container lebar">
        <div className="dua-kolom">
          <div>
            <p className="muted" style={{ marginTop: 8 }}>
              Pencairan minimal {MIN_TUKAR_POIN} poin (= {fmtRupiah(MIN_TUKAR_POIN * RUPIAH_PER_POIN)}).
              Tarif poin per kg diatur per jenis sampah.
            </p>
            <p style={{ display: "grid", gap: 6 }}>
              <Link href="/ops/analitik">Lihat analitik &amp; tren</Link>
              <Link href="/ops/laporan">Unduh laporan CSV (LPJ)</Link>
              <Link href="/ops/jenis-sampah">Kelola jenis sampah &amp; tarif</Link>
              <Link href="/warga/peringkat">Lihat peringkat penabung kuartal ini</Link>
            </p>
          </div>

          <div>
            <h2 style={{ marginTop: 8 }}>Riwayat kamu</h2>
            <RiwayatList
              varian="ops"
              initialSetoran={initialSetoran}
              muatSetoran={muatSetoranOpsAction}
              muatPenukaran={muatPenukaranOpsAction}
              labelSetoran="Masuk (Setoran)"
              labelPenukaran="Keluar (Penukaran)"
              kosongSetoran="Belum ada setoran yang kamu proses."
              kosongPenukaran="Belum ada penukaran yang kamu proses."
            />
          </div>
        </div>
      </main>
    </>
  );
}
