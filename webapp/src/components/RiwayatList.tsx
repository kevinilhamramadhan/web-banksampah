"use client";
import { useState } from "react";
import { fmtRupiah } from "@/lib/constants";
import { fmtTanggal } from "@/lib/format";

export interface RiwayatPage<T> {
  items: T[];
  nextCursor: string | null;
}

// DTO serializable dari server (tanggal berupa string ISO). wargaNama hanya terisi utk varian ops.
export interface SetoranRow {
  id: string;
  tanggal: string;
  totalPoin: number;
  items: { jenisSampahNama: string; beratKg: number }[];
  wargaNama?: string;
}

export interface PenukaranRow {
  id: string;
  createdAt: string;
  status: "pending" | "confirmed" | "cancelled";
  poinDitukar: number;
  jumlahRupiah: number;
  wargaNama?: string;
}

const STATUS_LABEL: Record<PenukaranRow["status"], string> = {
  pending: "Menunggu",
  confirmed: "Berhasil",
  cancelled: "Dibatalkan",
};

interface Props {
  /* Fungsi render TIDAK boleh dikirim dari Server Component — baris dirender di sini,
     dipilih lewat varian yang serializable. Props fungsi di bawah adalah server action (boleh). */
  varian: "warga" | "ops";
  initialSetoran: RiwayatPage<SetoranRow>;
  muatSetoran: (cursor?: string) => Promise<RiwayatPage<SetoranRow> | { error: string }>;
  muatPenukaran: (cursor?: string) => Promise<RiwayatPage<PenukaranRow> | { error: string }>;
  kosongSetoran: string;
  kosongPenukaran: string;
  labelSetoran?: string;
  labelPenukaran?: string;
}

function BarisSetoran({ s, varian }: { s: SetoranRow; varian: Props["varian"] }) {
  const rincian = s.items.map((i) => `${i.jenisSampahNama} ${i.beratKg} kg`).join(", ");
  return (
    <div className="baris">
      <div>
        <div>{varian === "ops" ? s.wargaNama : rincian}</div>
        <div className="muted">
          {varian === "ops" ? `${rincian} • ${fmtTanggal(new Date(s.tanggal))}` : fmtTanggal(new Date(s.tanggal))}
        </div>
      </div>
      <strong style={{ color: "var(--hijau)" }}>+{s.totalPoin} poin</strong>
    </div>
  );
}

function BarisPenukaran({ p, varian }: { p: PenukaranRow; varian: Props["varian"] }) {
  return (
    <div className="baris">
      <div>
        <div>
          {varian === "ops" ? `${p.wargaNama} • ${STATUS_LABEL[p.status]}` : `${STATUS_LABEL[p.status]} • ${fmtRupiah(p.jumlahRupiah)}`}
        </div>
        <div className="muted">{fmtTanggal(new Date(p.createdAt))}</div>
      </div>
      {varian === "ops" ? (
        <strong>{fmtRupiah(p.jumlahRupiah)}</strong>
      ) : (
        <strong style={{ color: p.status === "confirmed" ? "var(--merah)" : "var(--teks-redup)" }}>
          {p.status === "confirmed" ? `-${p.poinDitukar} poin` : `${p.poinDitukar} poin`}
        </strong>
      )}
    </div>
  );
}

export default function RiwayatList({
  varian,
  initialSetoran,
  muatSetoran,
  muatPenukaran,
  kosongSetoran,
  kosongPenukaran,
  labelSetoran = "Setoran",
  labelPenukaran = "Penukaran",
}: Props) {
  const [tab, setTab] = useState<"setoran" | "penukaran">("setoran");

  const [setoran, setSetoran] = useState(initialSetoran.items);
  const [setoranCursor, setSetoranCursor] = useState(initialSetoran.nextCursor);
  const [setoranSibuk, setSetoranSibuk] = useState(false);
  const [setoranError, setSetoranError] = useState("");

  const [penukaran, setPenukaran] = useState<PenukaranRow[] | null>(null);
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
                <BarisSetoran s={s} varian={varian} />
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
              <BarisPenukaran p={p} varian={varian} />
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
