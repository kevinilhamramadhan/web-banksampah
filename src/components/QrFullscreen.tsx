import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { fmtRupiah } from "../lib/constants";
import { sisaDetik } from "../lib/format";
import type { Penukaran } from "../lib/models";

interface Props {
  penukaran: Penukaran;
  onBuatUlang: () => void;
  onBatalkan: () => void;
  onTutup: () => void;
}

/** Layar QR full-screen di perangkat ops. Status berubah otomatis via snapshot dokumen. */
export default function QrFullscreen({ penukaran: p, onBuatUlang, onBatalkan, onTutup }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sisa, setSisa] = useState(() => sisaDetik(p.tokenExpiredAt));

  useEffect(() => {
    const t = setInterval(() => setSisa(sisaDetik(p.tokenExpiredAt)), 500);
    return () => clearInterval(t);
  }, [p.tokenExpiredAt]);

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
        Minta warga scan QR ini • <strong>{Math.floor(sisa / 60)}:{String(sisa % 60).padStart(2, "0")}</strong>
      </p>
      <button className="btn bahaya" style={{ maxWidth: 360 }} onClick={onBatalkan}>
        Batalkan
      </button>
    </div>
  );
}
