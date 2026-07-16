import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import RiwayatList from "../components/RiwayatList";
import { useAuth } from "../lib/auth";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN, TARIF_POIN_PER_KG, fmtRupiah } from "../lib/constants";
import { fmtTanggal } from "../lib/format";
import type { Penukaran, Setoran } from "../lib/models";
import { logout, penukaranPage, setoranPage } from "../lib/repo";

const STATUS_LABEL: Record<Penukaran["status"], string> = {
  pending: "Menunggu",
  confirmed: "Berhasil",
  cancelled: "Dibatalkan",
};

export default function Ops() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user!.uid;
  const [tab, setTab] = useState<"masuk" | "keluar">("masuk");

  const fetchSetoran = useCallback((after: QueryDocumentSnapshot | null) => setoranPage("opsId", uid, after), [uid]);
  const fetchPenukaran = useCallback((after: QueryDocumentSnapshot | null) => penukaranPage("opsId", uid, after), [uid]);

  const keluar = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="container lebar">
      <div className="baris" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Ops Bank Sampah</h1>
        <button className="btn kecil bahaya" onClick={keluar}>
          Keluar
        </button>
      </div>

      <div className="dua-kolom">
        <div>
          <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
            <Link to="/ops/setoran" style={{ textDecoration: "none" }}>
              <button className="btn">Input Setoran Sampah</button>
            </Link>
            <Link to="/ops/penukaran" style={{ textDecoration: "none" }}>
              <button className="btn sekunder">Penukaran Poin (QR)</button>
            </Link>
          </div>
          <p className="muted">
            Tarif: 1 kg sampah = {TARIF_POIN_PER_KG} poin • pencairan min. {MIN_TUKAR_POIN} poin (= {fmtRupiah(MIN_TUKAR_POIN * RUPIAH_PER_POIN)})
          </p>
        </div>

        <div>
          <div className="tab-bar" role="tablist">
            <button className={`chip ${tab === "masuk" ? "aktif" : ""}`} role="tab" aria-selected={tab === "masuk"} onClick={() => setTab("masuk")}>
              Masuk (Setoran)
            </button>
            <button className={`chip ${tab === "keluar" ? "aktif" : ""}`} role="tab" aria-selected={tab === "keluar"} onClick={() => setTab("keluar")}>
              Keluar (Penukaran)
            </button>
          </div>

          {tab === "masuk" ? (
            <RiwayatList<Setoran>
              fetchPage={fetchSetoran}
              kosong="Belum ada setoran yang kamu proses."
              renderItem={(s) => (
                <div className="baris">
                  <div>
                    <div>{s.wargaNama}</div>
                    <div className="muted">
                      {s.items.map((i) => `${i.jenisSampahNama} ${i.beratKg} kg`).join(", ")} • {fmtTanggal(s.tanggal)}
                    </div>
                  </div>
                  <strong style={{ color: "var(--hijau)" }}>+{s.totalPoin} poin</strong>
                </div>
              )}
            />
          ) : (
            <RiwayatList<Penukaran>
              fetchPage={fetchPenukaran}
              kosong="Belum ada penukaran yang kamu proses."
              renderItem={(p) => (
                <div className="baris">
                  <div>
                    <div>
                      {p.wargaNama} • {STATUS_LABEL[p.status]}
                    </div>
                    <div className="muted">{fmtTanggal(p.createdAt)}</div>
                  </div>
                  <strong>{fmtRupiah(p.jumlahRupiah)}</strong>
                </div>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
