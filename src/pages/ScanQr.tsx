import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import jsQR from "jsqr";
import VerifikasiBanner from "../components/VerifikasiBanner";
import { useAuth } from "../lib/auth";
import { fmtRupiah } from "../lib/constants";
import type { Penukaran } from "../lib/models";
import { confirmPenukaran } from "../lib/repo";

type BarcodeDetectorLike = { detect: (src: CanvasImageSource) => Promise<Array<{ rawValue: string }>> };

/** Baca satu QR dari kamera; resolve dengan isinya. Berhenti saat AbortSignal. */
async function bacaQr(video: HTMLVideoElement, signal: AbortSignal): Promise<string> {
  const Detector = (window as { BarcodeDetector?: new (o: { formats: string[] }) => BarcodeDetectorLike }).BarcodeDetector;
  const detector = Detector ? new Detector({ formats: ["qr_code"] }) : null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  while (!signal.aborted) {
    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      if (detector) {
        const codes = await detector.detect(video).catch(() => []);
        if (codes[0]?.rawValue) return codes[0].rawValue;
      } else {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height);
        if (code?.data) return code.data;
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new DOMException("dibatalkan", "AbortError");
}

export default function ScanQr() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fase, setFase] = useState<"scan" | "proses" | "sukses">("scan");
  const [hasil, setHasil] = useState<Penukaran | null>(null);
  const [error, setError] = useState("");
  const [ulang, setUlang] = useState(0); // ganti nilai untuk memulai ulang kamera

  const verified = user?.emailVerified === true;

  useEffect(() => {
    if (!verified || fase !== "scan") return;
    const abort = new AbortController();
    let stream: MediaStream | undefined;

    (async () => {
      const video = videoRef.current!;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      } catch {
        setError("Tidak bisa mengakses kamera. Izinkan akses kamera di browser lalu coba lagi.");
        return;
      }
      if (abort.signal.aborted) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      video.srcObject = stream;
      await video.play().catch(() => {});
      try {
        const token = await bacaQr(video, abort.signal);
        setFase("proses");
        const p = await confirmPenukaran(token);
        setHasil(p);
        setFase("sukses");
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return;
        const err = e as { code?: string; message?: string };
        setError(
          err.code === "permission-denied"
            ? "Penukaran ditolak sistem (QR kedaluwarsa, sudah diproses, atau saldo tidak cukup). Minta ops membuat QR baru."
            : (err.message ?? "Gagal memproses QR. Coba lagi."),
        );
        setFase("scan");
      }
    })();

    return () => {
      abort.abort();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [verified, fase, ulang]);

  return (
    <div className="container">
      <div className="baris" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Scan QR Penukaran</h1>
        <Link to="/warga">← Kembali</Link>
      </div>

      {!verified ? (
        <VerifikasiBanner />
      ) : fase === "sukses" && hasil ? (
        <div className="card kolom-tengah" style={{ padding: 32 }}>
          <div style={{ fontSize: "3rem" }} aria-hidden>
            ✔
          </div>
          <h2>Penukaran berhasil</h2>
          <p style={{ textAlign: "center" }}>
            {hasil.poinDitukar} poin ditukar. Terima uang tunai <strong>{fmtRupiah(hasil.jumlahRupiah)}</strong> dari ops.
          </p>
          <Link to="/warga" style={{ width: "100%", textDecoration: "none" }}>
            <button className="btn">Kembali ke Beranda</button>
          </Link>
        </div>
      ) : (
        <>
          <p className="muted">Arahkan kamera ke QR di layar ops.</p>
          {/* video selalu ter-mount saat scan/proses agar kamera tidak berkedip */}
          <video ref={videoRef} className="scan-video" muted playsInline />
          {fase === "proses" && <p className="sukses">QR terbaca — memproses penukaran…</p>}
          {error && (
            <>
              <p className="error">{error}</p>
              <button
                className="btn sekunder"
                onClick={() => {
                  setError("");
                  setUlang((u) => u + 1);
                }}
              >
                Scan lagi
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
