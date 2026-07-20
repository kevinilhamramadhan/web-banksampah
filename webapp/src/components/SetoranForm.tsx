"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import WargaSearch, { type WargaHasil } from "@/components/WargaSearch";
import { parseBerat, poinDari } from "@/lib/constants";
import { simpanSetoranAction, type SimpanSetoranState } from "@/lib/actions/ops";

export interface JenisPilihan {
  id: string;
  nama: string;
  tarifPoinPerKg: number;
}

export default function SetoranForm({ jenis: daftarJenis }: { jenis: JenisPilihan[] }) {
  const [warga, setWarga] = useState<WargaHasil | null>(null);
  const [jenisId, setJenisId] = useState<string | null>(null);
  const [berat, setBerat] = useState("");
  const [state, formAction, pending] = useActionState<SimpanSetoranState, FormData>(simpanSetoranAction, {});

  // Setelah simpan berhasil, kosongkan form seperti perilaku lama.
  useEffect(() => {
    if (state.sukses) {
      setJenisId(null);
      setBerat("");
      setWarga(null);
    }
  }, [state]);

  const jenisTerpilih = daftarJenis.find((j) => j.id === jenisId) ?? null;
  const b = parseBerat(berat);
  const poin = b !== null && jenisTerpilih ? poinDari(b, jenisTerpilih.tarifPoinPerKg) : 0;
  const valid = warga !== null && jenisTerpilih !== null && b !== null && poin > 0;

  if (daftarJenis.length === 0) {
    return (
      <div className="kartu-perhatian">
        <svg className="ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <strong>Belum ada jenis sampah aktif.</strong>
          <p className="muted" style={{ margin: "4px 0 8px" }}>
            Tambahkan jenis sampah &amp; tarifnya dulu sebelum mencatat setoran.
          </p>
          <Link className="btn kecil" href="/ops/jenis-sampah">Kelola Jenis Sampah</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {state.sukses && <p className="sukses">{state.sukses}</p>}

      {!warga ? (
        <WargaSearch onSelect={(w) => setWarga(w)} />
      ) : (
        <form action={formAction}>
          <input type="hidden" name="wargaId" value={warga.id} />
          <input type="hidden" name="jenisId" value={jenisId ?? ""} />

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
            {daftarJenis.map((j) => (
              <button
                key={j.id}
                type="button"
                className={`chip ${jenisId === j.id ? "aktif" : ""}`}
                aria-pressed={jenisId === j.id}
                onClick={() => setJenisId(j.id)}
              >
                {j.nama}
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
          {b !== null && jenisTerpilih && (
            <p className="sukses">
              = {poin} poin <span className="muted">(tarif {jenisTerpilih.tarifPoinPerKg} poin/kg)</span>
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
