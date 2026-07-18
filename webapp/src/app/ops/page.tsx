import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import { logoutAction } from "@/lib/actions/auth";
import { muatSetoranOpsAction, muatPenukaranOpsAction } from "@/lib/actions/ops";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN, TARIF_POIN_PER_KG, fmtRupiah } from "@/lib/constants";
import RiwayatList from "@/components/RiwayatList";

export default async function OpsPage() {
  await requireRole("ops");
  const setoranAwal = await muatSetoranOpsAction();
  const initialSetoran = "error" in setoranAwal ? { items: [], nextCursor: null } : setoranAwal;

  return (
    <div className="container lebar">
      <div className="baris" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Ops Bank Sampah</h1>
        <form action={logoutAction}>
          <button className="btn kecil bahaya" type="submit">
            Keluar
          </button>
        </form>
      </div>

      <div className="dua-kolom">
        <div>
          <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
            <Link href="/ops/setoran" style={{ textDecoration: "none" }}>
              <button className="btn">Input Setoran Sampah</button>
            </Link>
            <Link href="/ops/penukaran" style={{ textDecoration: "none" }}>
              <button className="btn sekunder">Penukaran Poin (QR)</button>
            </Link>
          </div>
          <p className="muted">
            Tarif: 1 kg sampah = {TARIF_POIN_PER_KG} poin • pencairan min. {MIN_TUKAR_POIN} poin (= {fmtRupiah(MIN_TUKAR_POIN * RUPIAH_PER_POIN)})
          </p>
        </div>

        <div>
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
    </div>
  );
}
