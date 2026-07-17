import { MIN_TUKAR_POIN, RUPIAH_PER_POIN, TARIF_POIN_PER_KG, fmtRupiah } from "@/lib/constants";

export default function SaldoCard({ nama, saldoPoin }: { nama: string; saldoPoin: number }) {
  return (
    <div className="saldo-card">
      <div className="baris">
        <span style={{ opacity: 0.85 }}>Saldo Poin</span>
        <span style={{ opacity: 0.85 }}>{nama}</span>
      </div>
      <div className="angka">{saldoPoin.toLocaleString("id-ID")}</div>
      <div className="rupiah">≈ {fmtRupiah(saldoPoin * RUPIAH_PER_POIN)}</div>
      <div className="aturan">
        1 kg sampah = {TARIF_POIN_PER_KG} poin • cair min. {MIN_TUKAR_POIN} poin ({fmtRupiah(MIN_TUKAR_POIN * RUPIAH_PER_POIN)})
      </div>
    </div>
  );
}
