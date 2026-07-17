"use client";
import { useState, type ReactNode } from "react";

export interface RiwayatPage<T> {
  items: T[];
  nextCursor: string | null;
}

interface Props<S extends { id: string }, P extends { id: string }> {
  initialSetoran: RiwayatPage<S>;
  muatSetoran: (cursor?: string) => Promise<RiwayatPage<S> | { error: string }>;
  muatPenukaran: (cursor?: string) => Promise<RiwayatPage<P> | { error: string }>;
  renderSetoran: (item: S) => ReactNode;
  renderPenukaran: (item: P) => ReactNode;
  kosongSetoran: string;
  kosongPenukaran: string;
  labelSetoran?: string;
  labelPenukaran?: string;
}

export default function RiwayatList<S extends { id: string }, P extends { id: string }>({
  initialSetoran,
  muatSetoran,
  muatPenukaran,
  renderSetoran,
  renderPenukaran,
  kosongSetoran,
  kosongPenukaran,
  labelSetoran = "Setoran",
  labelPenukaran = "Penukaran",
}: Props<S, P>) {
  const [tab, setTab] = useState<"setoran" | "penukaran">("setoran");

  const [setoran, setSetoran] = useState(initialSetoran.items);
  const [setoranCursor, setSetoranCursor] = useState(initialSetoran.nextCursor);
  const [setoranSibuk, setSetoranSibuk] = useState(false);
  const [setoranError, setSetoranError] = useState("");

  const [penukaran, setPenukaran] = useState<P[] | null>(null);
  const [penukaranCursor, setPenukaranCursor] = useState<string | null>(null);
  const [penukaranSibuk, setPenukaranSibuk] = useState(false);
  const [penukaranError, setPenukaranError] = useState("");

  const muatLebihSetoran = async (cursor: string | null) => {
    setSetoranSibuk(true);
    setSetoranError("");
    try {
      const page = await muatSetoran(cursor ?? undefined);
      if ("error" in page) {
        setSetoranError(page.error);
        return;
      }
      setSetoran((prev) => (cursor ? [...prev, ...page.items] : page.items));
      setSetoranCursor(page.nextCursor);
    } catch {
      setSetoranError("Gagal memuat riwayat. Coba lagi.");
    } finally {
      setSetoranSibuk(false);
    }
  };

  const muatLebihPenukaran = async (cursor: string | null) => {
    setPenukaranSibuk(true);
    setPenukaranError("");
    try {
      const page = await muatPenukaran(cursor ?? undefined);
      if ("error" in page) {
        setPenukaranError(page.error);
        return;
      }
      setPenukaran((prev) => (cursor ? [...(prev ?? []), ...page.items] : page.items));
      setPenukaranCursor(page.nextCursor);
    } catch {
      setPenukaranError("Gagal memuat riwayat. Coba lagi.");
    } finally {
      setPenukaranSibuk(false);
    }
  };

  const pilihTab = (t: "setoran" | "penukaran") => {
    setTab(t);
    if (t === "penukaran" && penukaran === null) void muatLebihPenukaran(null);
  };

  return (
    <div>
      <div className="tab-bar" role="tablist">
        <button
          className={`chip ${tab === "setoran" ? "aktif" : ""}`}
          role="tab"
          aria-selected={tab === "setoran"}
          onClick={() => pilihTab("setoran")}
        >
          {labelSetoran}
        </button>
        <button
          className={`chip ${tab === "penukaran" ? "aktif" : ""}`}
          role="tab"
          aria-selected={tab === "penukaran"}
          onClick={() => pilihTab("penukaran")}
        >
          {labelPenukaran}
        </button>
      </div>

      {tab === "setoran" ? (
        setoranError ? (
          <p className="error">{setoranError}</p>
        ) : !setoranSibuk && setoran.length === 0 ? (
          <p className="muted">{kosongSetoran}</p>
        ) : (
          <div>
            {setoran.map((s) => (
              <div className="riwayat-item" key={s.id}>
                {renderSetoran(s)}
              </div>
            ))}
            {setoranSibuk && <p className="muted">Memuat…</p>}
            {!setoranSibuk && setoranCursor && (
              <button className="btn kecil sekunder" style={{ margin: "12px auto" }} onClick={() => void muatLebihSetoran(setoranCursor)}>
                Muat lebih banyak
              </button>
            )}
          </div>
        )
      ) : penukaranError ? (
        <p className="error">{penukaranError}</p>
      ) : !penukaranSibuk && (penukaran ?? []).length === 0 ? (
        <p className="muted">{kosongPenukaran}</p>
      ) : (
        <div>
          {(penukaran ?? []).map((p) => (
            <div className="riwayat-item" key={p.id}>
              {renderPenukaran(p)}
            </div>
          ))}
          {penukaranSibuk && <p className="muted">Memuat…</p>}
          {!penukaranSibuk && penukaranCursor && (
            <button className="btn kecil sekunder" style={{ margin: "12px auto" }} onClick={() => void muatLebihPenukaran(penukaranCursor)}>
              Muat lebih banyak
            </button>
          )}
        </div>
      )}
    </div>
  );
}
