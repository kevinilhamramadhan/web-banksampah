import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import { setoranPage } from "@/lib/setoran";
import { muatSetoranAction, muatPenukaranAction } from "@/lib/actions/warga";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN, TARIF_POIN_PER_KG, fmtRupiah } from "@/lib/constants";
import AppHeader from "@/components/AppHeader";
import TombolKeluar from "@/components/TombolKeluar";
import VerifikasiBanner from "@/components/VerifikasiBanner";
import RiwayatList from "@/components/RiwayatList";
import InstallButtonKecil from "@/components/InstallButtonKecil";

export default async function WargaPage() {
  const user = await requireRole("warga");
  const verified = !!user.emailVerifiedAt;
  const setoranAwal = verified ? await setoranPage("wargaId", user.id) : { items: [], nextCursor: null };
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
    <>
      <AppHeader judul="Bank Sampah" kelas="saldo-panel" aksi={<TombolKeluar />}>
        <div className="label" style={{ marginTop: 20 }}>
          Saldo poin {user.nama}
        </div>
        <div className="angka">
          {user.saldoPoin.toLocaleString("id-ID")}
          <span className="satuan"> poin</span>
        </div>
        <div className="rupiah">≈ {fmtRupiah(user.saldoPoin * RUPIAH_PER_POIN)}</div>
        <div className="aturan">
          1 kg sampah = {TARIF_POIN_PER_KG} poin • cair min. {MIN_TUKAR_POIN} poin (
          {fmtRupiah(MIN_TUKAR_POIN * RUPIAH_PER_POIN)})
        </div>
      </AppHeader>

      <main className="container">
        {!verified ? (
          /* Satu layar, satu tugas: sebelum verifikasi, fokus hanya ke sini. */
          <VerifikasiBanner email={user.email} />
        ) : (
          <>
            <h2>Riwayat</h2>
            <RiwayatList
              varian="warga"
              initialSetoran={initialSetoran}
              muatSetoran={muatSetoranAction}
              muatPenukaran={muatPenukaranAction}
              kosongSetoran="Belum ada setoran. Bawa sampahmu ke bank sampah, ya!"
              kosongPenukaran="Belum ada penukaran poin."
            />

            <InstallButtonKecil />
          </>
        )}
      </main>
    </>
  );
}
