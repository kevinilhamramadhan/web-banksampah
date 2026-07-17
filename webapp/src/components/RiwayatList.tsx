"use client";
import { useState } from "react";
import { muatSetoranAction, muatPenukaranAction } from "@/lib/actions/warga";
import type { SetoranRingkas, PenukaranRingkas, RiwayatPage } from "@/lib/actions/warga";
import { fmtRupiah } from "@/lib/constants";
import { fmtTanggal } from "@/lib/format";

const STATUS_LABEL: Record<PenukaranRingkas["status"], string> = {
  pending: "Menunggu",
  confirmed: "Berhasil",
  cancelled: "Dibatalkan",
};

interface Props {
  initialSetoran: RiwayatPage<SetoranRingkas>;
}

export default function RiwayatList({ initialSetoran }: Props) {
  const [tab, setTab] = useState<"setoran" | "penukaran">("setoran");

  const [setoran, setSetoran] = useState(initialSetoran.items);
  const [setoranCursor, setSetoranCursor] = useState(initialSetoran.nextCursor);
  const [setoranSibuk, setSetoranSibuk] = useState(false);
  const [setoranError, setSetoranError] = useState("");

  const [penukaran, setPenukaran] = useState<PenukaranRingkas[] | null>(null);
  const [penukaranCursor, setPenukaranCursor] = useState<string | null>(null);
  const [penukaranSibuk, setPenukaranSibuk] = useState(false);
  const [penukaranError, setPenukaranError] = useState("");

  const muatSetoran = async (cursor: string | null) => {
    setSetoranSibuk(true);
    setSetoranError("");
    try {
      const page = await muatSetoranAction(cursor ?? undefined);
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

  const muatPenukaran = async (cursor: string | null) => {
    setPenukaranSibuk(true);
    setPenukaranError("");
    try {
      const page = await muatPenukaranAction(cursor ?? undefined);
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
    if (t === "penukaran" && penukaran === null) void muatPenukaran(null);
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
          Setoran
        </button>
        <button
          className={`chip ${tab === "penukaran" ? "aktif" : ""}`}
          role="tab"
          aria-selected={tab === "penukaran"}
          onClick={() => pilihTab("penukaran")}
        >
          Penukaran
        </button>
      </div>

      {tab === "setoran" ? (
        setoranError ? (
          <p className="error">{setoranError}</p>
        ) : !setoranSibuk && setoran.length === 0 ? (
          <p className="muted">Belum ada setoran. Bawa sampahmu ke bank sampah, ya!</p>
        ) : (
          <div>
            {setoran.map((s) => (
              <div className="riwayat-item" key={s.id}>
                <div className="baris">
                  <div>
                    <div>{s.items.map((i) => `${i.jenisSampahNama} ${i.beratKg} kg`).join(", ")}</div>
                    <div className="muted">{fmtTanggal(new Date(s.tanggal))}</div>
                  </div>
                  <strong style={{ color: "var(--hijau)" }}>+{s.totalPoin} poin</strong>
                </div>
              </div>
            ))}
            {setoranSibuk && <p className="muted">Memuat…</p>}
            {!setoranSibuk && setoranCursor && (
              <button className="btn kecil sekunder" style={{ margin: "12px auto" }} onClick={() => void muatSetoran(setoranCursor)}>
                Muat lebih banyak
              </button>
            )}
          </div>
        )
      ) : penukaranError ? (
        <p className="error">{penukaranError}</p>
      ) : !penukaranSibuk && (penukaran ?? []).length === 0 ? (
        <p className="muted">Belum ada penukaran poin.</p>
      ) : (
        <div>
          {(penukaran ?? []).map((p) => (
            <div className="riwayat-item" key={p.id}>
              <div className="baris">
                <div>
                  <div>
                    {STATUS_LABEL[p.status]} • {fmtRupiah(p.jumlahRupiah)}
                  </div>
                  <div className="muted">{fmtTanggal(new Date(p.createdAt))}</div>
                </div>
                <strong style={{ color: p.status === "confirmed" ? "var(--merah)" : "var(--teks-redup)" }}>
                  {p.status === "confirmed" ? `-${p.poinDitukar} poin` : `${p.poinDitukar} poin`}
                </strong>
              </div>
            </div>
          ))}
          {penukaranSibuk && <p className="muted">Memuat…</p>}
          {!penukaranSibuk && penukaranCursor && (
            <button className="btn kecil sekunder" style={{ margin: "12px auto" }} onClick={() => void muatPenukaran(penukaranCursor)}>
              Muat lebih banyak
            </button>
          )}
        </div>
      )}
    </div>
  );
}
