import { requireRole } from "@/lib/session-next";
import { muatSetoranOpsAction, muatPenukaranOpsAction } from "@/lib/actions/ops";
import AppHeader from "@/components/AppHeader";
import RiwayatList from "@/components/RiwayatList";

export default async function OpsRiwayatPage() {
  await requireRole("ops");
  const setoranAwal = await muatSetoranOpsAction();
  const initialSetoran = "error" in setoranAwal ? { items: [], nextCursor: null } : setoranAwal;

  return (
    <>
      <AppHeader judul="Riwayat" />
      <main className="container">
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
      </main>
    </>
  );
}
