import { requireRole } from "@/lib/session-next";
import AppHeader from "@/components/AppHeader";
import UnduhLaporan from "@/components/UnduhLaporan";

export default async function OpsLaporanPage() {
  await requireRole("ops");
  return (
    <>
      <AppHeader judul="Laporan (LPJ)" />
      <main className="container">
        <p className="muted">
          Unduh rekap setoran atau penukaran per periode dalam format CSV (bisa dibuka di
          Excel / Google Sheets) untuk laporan pertanggungjawaban ke desa.
        </p>
        <UnduhLaporan />
      </main>
    </>
  );
}
