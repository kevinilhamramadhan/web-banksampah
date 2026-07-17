import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import { setoranPage } from "@/lib/setoran";
import { logoutAction } from "@/lib/actions/auth";
import SaldoCard from "@/components/SaldoCard";
import VerifikasiBanner from "@/components/VerifikasiBanner";
import RiwayatList from "@/components/RiwayatList";

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

      <RiwayatList initialSetoran={initialSetoran} />
    </div>
  );
}
