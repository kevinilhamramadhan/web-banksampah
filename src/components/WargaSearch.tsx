import { useEffect, useRef, useState } from "react";
import type { UserDoc } from "../lib/models";
import { searchWarga } from "../lib/repo";

/** Cari warga by nama / no HP (prefix, debounce 300ms) lalu pilih satu. */
export default function WargaSearch({ onSelect }: { onSelect: (w: UserDoc) => void }) {
  const [teks, setTeks] = useState("");
  const [hasil, setHasil] = useState<UserDoc[]>([]);
  const [sibuk, setSibuk] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!teks.trim()) {
      setHasil([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setSibuk(true);
      try {
        setHasil(await searchWarga(teks));
      } finally {
        setSibuk(false);
      }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [teks]);

  return (
    <div>
      <label htmlFor="cari-warga">Cari warga (nama / no HP)</label>
      <input
        id="cari-warga"
        className="input"
        placeholder="mis. budi atau 0812…"
        value={teks}
        onChange={(e) => setTeks(e.target.value)}
        autoComplete="off"
      />
      {sibuk && <p className="muted">Mencari…</p>}
      {!sibuk && teks.trim() !== "" && hasil.length === 0 && <p className="muted">Tidak ada warga yang cocok.</p>}
      {hasil.map((w) => (
        <button
          key={w.uid}
          className="card baris"
          style={{ width: "100%", textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit" }}
          onClick={() => {
            onSelect(w);
            setTeks("");
            setHasil([]);
          }}
        >
          <span>
            <strong>{w.nama}</strong>
            <br />
            <span className="muted">{w.noHp}</span>
          </span>
          <span className="muted">{w.saldoPoin} poin</span>
        </button>
      ))}
    </div>
  );
}
