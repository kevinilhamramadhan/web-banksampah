import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import { setoranPage } from "@/lib/setoran";
import { logoutAction } from "@/lib/actions/auth";
import { muatSetoranAction, muatPenukaranAction } from "@/lib/actions/warga";
import type { SetoranRingkas, PenukaranRingkas } from "@/lib/actions/warga";
import { fmtRupiah } from "@/lib/constants";
import { fmtTanggal } from "@/lib/format";
import SaldoCard from "@/components/SaldoCard";
import VerifikasiBanner from "@/components/VerifikasiBanner";
import RiwayatList from "@/components/RiwayatList";

const STATUS_LABEL: Record<PenukaranRingkas["status"], string> = {
  pending: "Menunggu",
  confirmed: "Berhasil",
  cancelled: "Dibatalkan",
};

export default async function WargaPage() {
  const user = await requireRole("warga");
  const setoranAwal = await setoranPage("wargaId", user.id);
  const initialSetoran = {
    items: setoranAwal.items.map((s) => ({
      id: s.id,
      tanggal: s.tanggal.toISOString(),
      totalPoin: s.totalPoin,
      items: s.items.map((i) => ({ jenisSampahNama: i.jenisSampahNama, beratKg: i.beratKg })),
    })),
    nextCursor: setoranAwal.nextCursor,
  };

  return (
    <div className="container">
      <div className="baris" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Bank Sampah</h1>
        <form action={logoutAction}>
          <button className="btn kecil bahaya" type="submit">
            Keluar
          </button>
        </form>
      </div>

      <SaldoCard nama={user.nama} saldoPoin={user.saldoPoin} />
      {!user.emailVerifiedAt && <VerifikasiBanner email={user.email} />}

      <Link href="/warga/scan" style={{ textDecoration: "none" }}>
        <button className="btn" disabled={!user.emailVerifiedAt} style={{ marginBottom: 16 }}>
          Scan QR Penukaran Poin
        </button>
      </Link>

      <RiwayatList<SetoranRingkas, PenukaranRingkas>
        initialSetoran={initialSetoran}
        muatSetoran={muatSetoranAction}
        muatPenukaran={muatPenukaranAction}
        kosongSetoran="Belum ada setoran. Bawa sampahmu ke bank sampah, ya!"
        kosongPenukaran="Belum ada penukaran poin."
        renderSetoran={(s) => (
          <div className="baris">
            <div>
              <div>{s.items.map((i) => `${i.jenisSampahNama} ${i.beratKg} kg`).join(", ")}</div>
              <div className="muted">{fmtTanggal(new Date(s.tanggal))}</div>
            </div>
            <strong style={{ color: "var(--hijau)" }}>+{s.totalPoin} poin</strong>
          </div>
        )}
        renderPenukaran={(p) => (
          <div className="baris">
            <div>
              <div>
                {STATUS_LABEL[p.status]} • {fmtRupiah(p.jumlahRupiah)}
              </div>
              <div className="muted">{fmtTanggal(new Date(p.createdAt))}</div>
            </div>
            <strong style={{ color: p.status === "confirmed" ? "var(--merah)" : "var(--teks-redup)" }}>
              {p.status === "confirmed" ? `-${p.poinDitukar} poin` : `${p.poinDitukar} poin`}
            </strong>
          </div>
        )}
      />
    </div>
  );
}
