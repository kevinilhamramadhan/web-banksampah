"use client";
import { useActionState, useEffect, useState } from "react";
import WargaSearch, { type WargaHasil } from "@/components/WargaSearch";
import QrFullscreen from "@/components/QrFullscreen";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN, fmtRupiah } from "@/lib/constants";
import { buatPenukaranAction, batalkanPenukaranAction, type BuatPenukaranState, type PenukaranDTO } from "@/lib/actions/ops";

export default function PenukaranForm() {
  const [warga, setWarga] = useState<WargaHasil | null>(null);
  const [poinTeks, setPoinTeks] = useState("");
  const [aktif, setAktif] = useState<PenukaranDTO | null>(null);
  const [state, formAction, pending] = useActionState<BuatPenukaranState, FormData>(buatPenukaranAction, {});

  // Setiap kali server berhasil membuat penukaran (termasuk "Buat Ulang"), tampilkan layar QR.
  useEffect(() => {
    if (state.data) setAktif(state.data);
  }, [state.data]);

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

  const [buatUlangError, setBuatUlangError] = useState("");

  const buatUlang = async () => {
    if (!warga || poin === null) return;
    setBuatUlangError("");

    if (aktif) {
      const hasil = await batalkanPenukaranAction(aktif.id).catch((e: unknown) => ({
        error: e instanceof Error ? e.message : "Gagal membatalkan penukaran.",
      }));
      if ("error" in hasil) {
        // Batal gagal (mis. sudah confirmed) — cek status sebenarnya sebelum bikin QR baru,
        // supaya tidak minta warga scan ulang dan double-debit saldo.
        try {
          const res = await fetch(`/api/penukaran/${aktif.id}`, { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { status: "pending" | "confirmed" | "cancelled" };
            if (data.status === "confirmed") {
              setAktif((prev) => (prev ? { ...prev, status: "confirmed" } : prev));
              return;
            }
          }
        } catch {
          // abaikan; tetap tolak buat QR baru di bawah demi keamanan
        }
        // Bukan confirmed (mis. sudah cancelled oleh proses lain) — tutup layar QR lama, jangan buat yang baru
        // otomatis; biarkan ops cek dulu lalu ulangi manual supaya tidak double-debit.
        setAktif(null);
        setBuatUlangError("Penukaran sebelumnya sudah diproses. Tidak bisa membuat QR baru — periksa statusnya dulu.");
        return;
      }
    }

    const fd = new FormData();
    fd.set("wargaId", warga.id);
    fd.set("poin", String(poin));
    formAction(fd);
  };

  const batalkan = () => {
    if (aktif) void batalkanPenukaranAction(aktif.id).catch(() => {});
    setAktif(null);
  };

  const selesai = () => {
    setAktif(null);
    setWarga(null);
    setPoinTeks("");
    setBuatUlangError("");
  };

  return (
    <div>
      {!warga ? (
        <WargaSearch onSelect={setWarga} />
      ) : (
        <form action={formAction}>
          <input type="hidden" name="wargaId" value={warga.id} />

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

          <label htmlFor="poin">Poin yang ditukar</label>
          <input
            id="poin"
            name="poin"
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

          {state.error && <p className="error">{state.error}</p>}
          {buatUlangError && <p className="error">{buatUlangError}</p>}
          <button className="btn" type="submit" disabled={!valid || pending} style={{ marginTop: 16 }}>
            {pending ? "Membuat…" : "Buat Permintaan Penukaran"}
          </button>
        </form>
      )}

      {aktif && <QrFullscreen penukaran={aktif} onBuatUlang={buatUlang} onBatalkan={batalkan} onTutup={selesai} />}
    </div>
  );
}
