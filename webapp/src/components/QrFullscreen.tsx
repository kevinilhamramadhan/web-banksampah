"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { fmtRupiah } from "@/lib/constants";
import { sisaDetik } from "@/lib/format";
import type { PenukaranDTO } from "@/lib/actions/ops";

interface Props {
  penukaran: PenukaranDTO;
  onBuatUlang: () => void;
  onBatalkan: () => void;
  onTutup: () => void;
}

/** Layar QR full-screen di perangkat ops. Status berubah otomatis via polling (pengganti onSnapshot). */
export default function QrFullscreen({ penukaran: awal, onBuatUlang, onBatalkan, onTutup }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [p, setP] = useState(awal);
  const [sisa, setSisa] = useState(() => sisaDetik(new Date(awal.tokenExpiredAt)));
  // Status cek akhir saat countdown habis: "belum" | "berjalan" | "selesai".
  const [cekAkhir, setCekAkhir] = useState<"belum" | "berjalan" | "selesai">("belum");

  // Reset saat QR diganti (mis. tombol "Buat Ulang" membuat penukaran baru).
  useEffect(() => {
    setP(awal);
    setCekAkhir("belum");
  }, [awal]);

  useEffect(() => {
    const t = setInterval(() => setSisa(sisaDetik(new Date(p.tokenExpiredAt))), 500);
    return () => clearInterval(t);
  }, [p.tokenExpiredAt]);

  // Polling status tiap 2 dtk; berhenti otomatis saat status final atau QR kedaluwarsa.
  useEffect(() => {
    if (p.status !== "pending") return;
    const cek = async () => {
      if (new Date(p.tokenExpiredAt) <= new Date()) return;
      try {
        const res = await fetch(`/api/penukaran/${p.id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          status: "pending" | "confirmed" | "cancelled";
          poinDitukar: number;
          jumlahRupiah: number;
          tokenExpiredAt: string;
        };
        setP((prev) => ({ ...prev, ...data }));
      } catch {
        // abaikan; dicoba lagi di interval berikutnya
      }
    };
    const iv = setInterval(() => {
      if (new Date(p.tokenExpiredAt) <= new Date()) {
        clearInterval(iv);
        return;
      }
      void cek();
    }, 2000);
    return () => clearInterval(iv);
  }, [p.id, p.status, p.tokenExpiredAt]);

  // Saat countdown habis: satu cek status terakhir sebelum menampilkan "kedaluwarsa".
  // Menutup celah balapan di mana warga konfirmasi dalam <=2 dtk terakhir tanpa sempat terpoll.
  useEffect(() => {
    if (p.status !== "pending" || sisa > 0 || cekAkhir !== "belum") return;
    setCekAkhir("berjalan");
    (async () => {
      try {
        const res = await fetch(`/api/penukaran/${p.id}`, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as {
            status: "pending" | "confirmed" | "cancelled";
            poinDitukar: number;
            jumlahRupiah: number;
            tokenExpiredAt: string;
          };
          setP((prev) => ({ ...prev, ...data }));
        }
      } catch {
        // abaikan; tetap tampilkan layar kedaluwarsa
      } finally {
        setCekAkhir("selesai");
      }
    })();
  }, [p.id, p.status, sisa, cekAkhir]);

  useEffect(() => {
    if (canvasRef.current && p.status === "pending") {
      void QRCode.toCanvas(canvasRef.current, p.qrToken, { width: 480, margin: 2 });
    }
  }, [p.qrToken, p.status]);

  if (p.status === "confirmed") {
    return (
      <div className="qr-layar">
        <div style={{ fontSize: "4rem" }} aria-hidden>
          ✔
        </div>
        <h2>Terkonfirmasi</h2>
        <p style={{ fontSize: "1.4rem" }}>
          Serahkan uang tunai <strong>{fmtRupiah(p.jumlahRupiah)}</strong> kepada {p.wargaNama}.
        </p>
        <button className="btn" style={{ maxWidth: 360 }} onClick={onTutup}>
          Selesai
        </button>
      </div>
    );
  }

  if (p.status === "cancelled") {
    return (
      <div className="qr-layar">
        <h2>Penukaran dibatalkan</h2>
        <button className="btn" style={{ maxWidth: 360 }} onClick={onTutup}>
          Tutup
        </button>
      </div>
    );
  }

  if (sisa <= 0) {
    // Tunggu hasil cek status akhir dulu — jangan sampai bilang "kedaluwarsa" padahal baru saja terkonfirmasi.
    if (cekAkhir !== "selesai") {
      return (
        <div className="qr-layar">
          <h2>Memeriksa status…</h2>
        </div>
      );
    }
    return (
      <div className="qr-layar">
        <h2>QR kedaluwarsa</h2>
        <p className="muted">Belum discan dalam waktu yang ditentukan.</p>
        <button className="btn" style={{ maxWidth: 360 }} onClick={onBuatUlang}>
          Buat Ulang QR
        </button>
        <button className="btn bahaya" style={{ maxWidth: 360 }} onClick={onBatalkan}>
          Batalkan
        </button>
      </div>
    );
  }

  return (
    <div className="qr-layar">
      <h2>
        {p.wargaNama} • {p.poinDitukar} poin → {fmtRupiah(p.jumlahRupiah)}
      </h2>
      <canvas ref={canvasRef} />
      <p style={{ fontSize: "1.25rem" }}>
        Minta warga scan QR ini •{" "}
        <strong>
          {Math.floor(sisa / 60)}:{String(sisa % 60).padStart(2, "0")}
        </strong>
      </p>
      <button className="btn bahaya" style={{ maxWidth: 360 }} onClick={onBatalkan}>
        Batalkan
      </button>
    </div>
  );
}
