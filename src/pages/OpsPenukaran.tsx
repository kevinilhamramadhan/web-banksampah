import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QrFullscreen from "../components/QrFullscreen";
import WargaSearch from "../components/WargaSearch";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN, fmtRupiah } from "../lib/constants";
import type { Penukaran, UserDoc } from "../lib/models";
import { cancelPenukaran, createPenukaran, onPenukaran } from "../lib/repo";

export default function OpsPenukaran() {
  const [warga, setWarga] = useState<UserDoc | null>(null);
  const [poinTeks, setPoinTeks] = useState("");
  const [aktifId, setAktifId] = useState<string | null>(null);
  const [aktif, setAktif] = useState<Penukaran | null>(null);
  const [error, setError] = useState("");
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    if (!aktifId) {
      setAktif(null);
      return;
    }
    return onPenukaran(aktifId, setAktif);
  }, [aktifId]);

  const poin = /^\d+$/.test(poinTeks.trim()) ? Number(poinTeks.trim()) : null;
  const masalah =
    poin === null
      ? null
      : poin < MIN_TUKAR_POIN
        ? `Minimal penukaran ${MIN_TUKAR_POIN} poin.`
        : warga && poin > warga.saldoPoin
          ? `Saldo ${warga.nama} hanya ${warga.saldoPoin} poin.`
          : null;
  const valid = warga !== null && poin !== null && masalah === null;

  const buat = async (w: UserDoc, p: number) => {
    setError("");
    setSibuk(true);
    try {
      setAktifId(await createPenukaran(w, p));
    } catch {
      setError("Gagal membuat permintaan penukaran. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  };

  const batalkan = async () => {
    if (aktifId) await cancelPenukaran(aktifId).catch(() => {});
    setAktifId(null);
  };

  const selesai = () => {
    setAktifId(null);
    setWarga(null);
    setPoinTeks("");
  };

  return (
    <div className="container">
      <div className="baris" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Penukaran Poin</h1>
        <Link to="/ops">← Beranda</Link>
      </div>

      {!warga ? (
        <WargaSearch onSelect={setWarga} />
      ) : (
        <>
          <div className="card baris">
            <span>
              <strong>{warga.nama}</strong>
              <br />
              <span className="muted">Saldo: {warga.saldoPoin} poin</span>
            </span>
            <button className="btn kecil sekunder" onClick={() => setWarga(null)}>
              Ganti
            </button>
          </div>

          <label htmlFor="poin">Poin yang ditukar</label>
          <input
            id="poin"
            className="input"
            inputMode="numeric"
            placeholder={`min. ${MIN_TUKAR_POIN}`}
            value={poinTeks}
            onChange={(e) => setPoinTeks(e.target.value)}
          />
          {masalah && <p className="error">{masalah}</p>}
          {valid && poin !== null && (
            <p className="sukses">
              = {fmtRupiah(poin * RUPIAH_PER_POIN)} <span className="muted">tunai</span>
            </p>
          )}

          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={!valid || sibuk} onClick={() => valid && buat(warga, poin!)} style={{ marginTop: 16 }}>
            {sibuk ? "Membuat…" : "Buat Permintaan Penukaran"}
          </button>
        </>
      )}

      {aktif && (
        <QrFullscreen
          penukaran={aktif}
          onBuatUlang={() => {
            if (warga && poin) {
              void cancelPenukaran(aktif.id).catch(() => {});
              void buat(warga, poin);
            }
          }}
          onBatalkan={() => void batalkan()}
          onTutup={selesai}
        />
      )}
    </div>
  );
}
