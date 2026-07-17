"use client";
import { useActionState, useEffect, useState } from "react";
import WargaSearch, { type WargaHasil } from "@/components/WargaSearch";
import { JENIS_SAMPAH, TARIF_POIN_PER_KG, parseBerat, poinDari } from "@/lib/constants";
import { simpanSetoranAction, type SimpanSetoranState } from "@/lib/actions/ops";

export default function SetoranForm() {
  const [warga, setWarga] = useState<WargaHasil | null>(null);
  const [jenis, setJenis] = useState<string | null>(null);
  const [berat, setBerat] = useState("");
  const [state, formAction, pending] = useActionState<SimpanSetoranState, FormData>(simpanSetoranAction, {});

  // Setelah simpan berhasil, kosongkan form seperti perilaku lama.
  useEffect(() => {
    if (state.sukses) {
      setJenis(null);
      setBerat("");
      setWarga(null);
    }
  }, [state]);

  const b = parseBerat(berat);
  const valid = warga !== null && jenis !== null && b !== null && poinDari(b) > 0;

  return (
    <div>
      {state.sukses && <p className="sukses">{state.sukses}</p>}

      {!warga ? (
        <WargaSearch
          onSelect={(w) => {
            setWarga(w);
          }}
        />
      ) : (
        <form action={formAction}>
          <input type="hidden" name="wargaId" value={warga.id} />
          <input type="hidden" name="jenis" value={jenis ?? ""} />

          <div className="card baris">
            <span>
              <strong>{warga.nama}</strong>
              <br />
              <span className="muted">Saldo: {warga.saldoPoin} poin</span>
            </span>
            <button className="btn kecil sekunder" type="button" onClick={() => setWarga(null)}>
              Ganti
            </button>
          </div>

          <label>Jenis sampah</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {JENIS_SAMPAH.map((j) => (
              <button key={j} type="button" className={`chip ${jenis === j ? "aktif" : ""}`} onClick={() => setJenis(j)}>
                {j}
              </button>
            ))}
          </div>

          <label htmlFor="berat">Berat sampah (kg)</label>
          <input
            id="berat"
            name="berat"
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

          {state.error && <p className="error">{state.error}</p>}
          <button className="btn" type="submit" disabled={!valid || pending} style={{ marginTop: 16 }}>
            {pending ? "Menyimpan…" : "Simpan Setoran"}
          </button>
        </form>
      )}
    </div>
  );
}
