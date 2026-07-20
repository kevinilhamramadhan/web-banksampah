"use client";
import { useEffect, useRef, useState } from "react";
import { cariWargaAction, type WargaHasil } from "@/lib/actions/ops";

export type { WargaHasil };

/** Cari warga by nama / no HP (prefix, debounce 300ms) lalu pilih satu. */
export default function WargaSearch({ onSelect }: { onSelect: (w: WargaHasil) => void }) {
  const [teks, setTeks] = useState("");
  const [hasil, setHasil] = useState<WargaHasil[]>([]);
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!teks.trim()) {
      setHasil([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setSibuk(true);
      setError("");
      try {
        const res = await cariWargaAction(teks);
        if ("error" in res) {
          setError(res.error);
          return;
        }
        setHasil(res);
      } catch {
        setError(
          navigator.onLine ? "Gagal mencari warga. Coba lagi." : "Kamu sedang offline — pencarian butuh koneksi.",
        );
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
      {error && <p className="error">{error}</p>}
      {!sibuk && !error && teks.trim() !== "" && hasil.length === 0 && <p className="muted">Tidak ada warga yang cocok.</p>}
      {hasil.map((w) => (
        <button
          key={w.id}
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
