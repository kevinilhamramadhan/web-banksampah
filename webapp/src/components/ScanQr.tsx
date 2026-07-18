"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import VerifikasiBanner from "./VerifikasiBanner";
import { confirmScanAction } from "@/lib/actions/warga";
import { fmtRupiah } from "@/lib/constants";

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

export default function ScanQr({ verified, email }: { verified: boolean; email: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fase, setFase] = useState<"scan" | "proses" | "sukses" | "error">("scan");
  const [hasil, setHasil] = useState<{ poin: number; rupiah: number } | null>(null);
  const [error, setError] = useState("");
  const [ulang, setUlang] = useState(0); // ganti nilai untuk memulai ulang kamera

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
        setFase("error");
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
        const res = await confirmScanAction(undefined, token);
        if ("error" in res) throw new Error(res.error);
        setHasil({ poin: res.poin, rupiah: res.rupiah });
        setFase("sukses");
        router.refresh();
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return;
        setError((e as Error).message || "Gagal memproses QR. Coba lagi.");
        setFase("error"); // jangan otomatis restart kamera; QR yg sama bisa terbaca ulang tiap detik saat error tampil
      }
    })();

    return () => {
      abort.abort();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [verified, fase, ulang, router]);

  return (
    <div className="container">
      <div className="baris" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Scan QR Penukaran</h1>
        <Link href="/warga">← Kembali</Link>
      </div>

      {!verified ? (
        <VerifikasiBanner email={email} />
      ) : fase === "sukses" && hasil ? (
        <div className="card kolom-tengah" style={{ padding: 32 }}>
          <div style={{ fontSize: "3rem" }} aria-hidden>
            ✔
          </div>
          <h2>Penukaran berhasil</h2>
          <p style={{ textAlign: "center" }}>
            {hasil.poin} poin ditukar. Terima uang tunai <strong>{fmtRupiah(hasil.rupiah)}</strong> dari ops.
          </p>
          <Link href="/warga" style={{ width: "100%", textDecoration: "none" }}>
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
                  setFase("scan");
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
