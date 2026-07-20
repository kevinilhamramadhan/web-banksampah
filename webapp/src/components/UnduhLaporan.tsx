"use client";
import { useState } from "react";

function isoHari(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function UnduhLaporan() {
  const now = new Date();
  const [dari, setDari] = useState(isoHari(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [sampai, setSampai] = useState(isoHari(now));
  const valid = dari !== "" && sampai !== "" && dari <= sampai;

  const unduh = (jenis: "setoran" | "penukaran") => {
    window.location.href = `/ops/laporan/export?jenis=${jenis}&dari=${dari}&sampai=${sampai}`;
  };

  return (
    <div className="card">
      <div className="baris" style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label htmlFor="dari">Dari tanggal</label>
          <input id="dari" type="date" className="input" value={dari} max={sampai} onChange={(e) => setDari(e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label htmlFor="sampai">Sampai tanggal</label>
          <input id="sampai" type="date" className="input" value={sampai} min={dari} onChange={(e) => setSampai(e.target.value)} />
        </div>
      </div>
      {!valid && <p className="error">Rentang tanggal tidak valid.</p>}
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <button className="btn" type="button" disabled={!valid} onClick={() => unduh("setoran")}>
          Unduh CSV Setoran
        </button>
        <button className="btn sekunder" type="button" disabled={!valid} onClick={() => unduh("penukaran")}>
          Unduh CSV Penukaran
        </button>
      </div>
    </div>
  );
}
