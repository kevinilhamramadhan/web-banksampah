import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import RiwayatList from "../components/RiwayatList";
import SaldoCard from "../components/SaldoCard";
import VerifikasiBanner from "../components/VerifikasiBanner";
import { useAuth } from "../lib/auth";
import { isStandalone, promptInstall, useCanInstall } from "../lib/install";
import { fmtRupiah } from "../lib/constants";
import { fmtTanggal } from "../lib/format";
import type { Penukaran, Setoran, UserDoc } from "../lib/models";
import { logout, onUserDoc, penukaranPage, setoranPage } from "../lib/repo";

const STATUS_LABEL: Record<Penukaran["status"], string> = {
  pending: "Menunggu",
  confirmed: "Berhasil",
  cancelled: "Dibatalkan",
};

export default function Warga() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user!.uid;
  const [profil, setProfil] = useState<UserDoc | null>(null);
  const [tab, setTab] = useState<"setoran" | "penukaran">("setoran");
  const canInstall = useCanInstall();

  useEffect(() => onUserDoc(uid, setProfil), [uid]);

  const fetchSetoran = useCallback((after: QueryDocumentSnapshot | null) => setoranPage("wargaId", uid, after), [uid]);
  const fetchPenukaran = useCallback((after: QueryDocumentSnapshot | null) => penukaranPage("wargaId", uid, after), [uid]);

  const keluar = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="container">
      <div className="baris" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Bank Sampah</h1>
        <button className="btn kecil bahaya" onClick={keluar}>
          Keluar
        </button>
      </div>

      <SaldoCard nama={profil?.nama ?? "…"} saldoPoin={profil?.saldoPoin ?? 0} />
      <VerifikasiBanner />

      <Link to="/warga/scan" style={{ textDecoration: "none" }}>
        <button className="btn" disabled={!user?.emailVerified} style={{ marginBottom: 16 }}>
          Scan QR Penukaran Poin
        </button>
      </Link>

      <div className="tab-bar" role="tablist">
        <button className={`chip ${tab === "setoran" ? "aktif" : ""}`} role="tab" aria-selected={tab === "setoran"} onClick={() => setTab("setoran")}>
          Setoran
        </button>
        <button className={`chip ${tab === "penukaran" ? "aktif" : ""}`} role="tab" aria-selected={tab === "penukaran"} onClick={() => setTab("penukaran")}>
          Penukaran
        </button>
      </div>

      {tab === "setoran" ? (
        <RiwayatList<Setoran>
          fetchPage={fetchSetoran}
          kosong="Belum ada setoran. Bawa sampahmu ke bank sampah, ya!"
          renderItem={(s) => (
            <div className="baris">
              <div>
                <div>{s.items.map((i) => `${i.jenisSampahNama} ${i.beratKg} kg`).join(", ")}</div>
                <div className="muted">{fmtTanggal(s.tanggal)}</div>
              </div>
              <strong style={{ color: "var(--hijau)" }}>+{s.totalPoin} poin</strong>
            </div>
          )}
        />
      ) : (
        <RiwayatList<Penukaran>
          fetchPage={fetchPenukaran}
          kosong="Belum ada penukaran poin."
          renderItem={(p) => (
            <div className="baris">
              <div>
                <div>
                  {STATUS_LABEL[p.status]} • {fmtRupiah(p.jumlahRupiah)}
                </div>
                <div className="muted">{fmtTanggal(p.createdAt)}</div>
              </div>
              <strong style={{ color: p.status === "confirmed" ? "var(--merah)" : "var(--teks-redup)" }}>
                {p.status === "confirmed" ? `-${p.poinDitukar} poin` : `${p.poinDitukar} poin`}
              </strong>
            </div>
          )}
        />
      )}

      {canInstall && !isStandalone() && (
        <button className="btn kecil sekunder" style={{ margin: "24px auto 0" }} onClick={() => void promptInstall()}>
          Install aplikasi di HP
        </button>
      )}
    </div>
  );
}
