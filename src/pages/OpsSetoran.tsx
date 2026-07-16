import { useState } from "react";
import { Link } from "react-router-dom";
import WargaSearch from "../components/WargaSearch";
import { JENIS_SAMPAH, TARIF_POIN_PER_KG, parseBerat, poinDari } from "../lib/constants";
import type { UserDoc } from "../lib/models";
import { createSetoran } from "../lib/repo";

export default function OpsSetoran() {
  const [warga, setWarga] = useState<UserDoc | null>(null);
  const [jenis, setJenis] = useState<string | null>(null);
  const [berat, setBerat] = useState("");
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
  const [sibuk, setSibuk] = useState(false);

  const b = parseBerat(berat);
  const valid = warga !== null && jenis !== null && b !== null && poinDari(b) > 0;

  const simpan = async () => {
    if (!valid || !warga || !jenis || !b) return;
    setError("");
    setSukses("");
    setSibuk(true);
    const poin = poinDari(b);
    try {
      await createSetoran(warga, [{ jenisSampahId: jenis.toLowerCase(), jenisSampahNama: jenis, beratKg: b, poin }]);
      setSukses(`Setoran ${jenis} ${berat} kg (+${poin} poin) untuk ${warga.nama} tersimpan.`);
      setJenis(null);
      setBerat("");
      setWarga(null);
    } catch {
      setError("Gagal menyimpan setoran. Periksa koneksi lalu coba lagi.");
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div className="container">
      <div className="baris" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Input Setoran</h1>
        <Link to="/ops">← Beranda</Link>
      </div>

      {sukses && <p className="sukses">{sukses}</p>}

      {!warga ? (
        <WargaSearch onSelect={(w) => { setWarga(w); setSukses(""); }} />
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

          <label>Jenis sampah</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {JENIS_SAMPAH.map((j) => (
              <button key={j} className={`chip ${jenis === j ? "aktif" : ""}`} onClick={() => setJenis(j)}>
                {j}
              </button>
            ))}
          </div>

          <label htmlFor="berat">Berat sampah (kg)</label>
          <input
            id="berat"
            className="input"
            inputMode="decimal"
            placeholder="mis. 1,5"
            value={berat}
            onChange={(e) => setBerat(e.target.value)}
          />
          {b !== null && (
            <p className="sukses">
              = {poinDari(b)} poin <span className="muted">(tarif {TARIF_POIN_PER_KG} poin/kg)</span>
            </p>
          )}

          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={!valid || sibuk} onClick={simpan} style={{ marginTop: 16 }}>
            {sibuk ? "Menyimpan…" : "Simpan Setoran"}
          </button>
        </>
      )}
    </div>
  );
}
