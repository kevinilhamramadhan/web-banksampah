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
  const judulSuksesRef = useRef<HTMLHeadingElement>(null);
  const [fase, setFase] = useState<"scan" | "proses" | "sukses" | "error">("scan");
  const [hasil, setHasil] = useState<{ poin: number; rupiah: number } | null>(null);
  const [error, setError] = useState("");
  const [ulang, setUlang] = useState(0); // ganti nilai untuk memulai ulang kamera

  // Kelola fokus: saat layar perayaan menggantikan tampilan scan, pengguna
  // keyboard/screen-reader dipindahkan ke judulnya (role=status saja tidak cukup).
  useEffect(() => {
    if (fase === "sukses") judulSuksesRef.current?.focus();
  }, [fase]);

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
        // Batas tunggu 20 dtk: koneksi desa bisa lambat; server punya guard anti-replay,
        // jadi scan ulang setelah cek saldo tidak akan memotong dua kali.
        const timeout = new Promise<never>((_, tolak) =>
          setTimeout(
            () =>
              tolak(
                new Error(
                  "Koneksi lambat, proses belum tuntas. Cek saldo di beranda dulu; kalau belum terpotong, scan lagi.",
                ),
              ),
            20_000,
          ),
        );
        const res = await Promise.race([confirmScanAction(undefined, token), timeout]);
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

  if (fase === "sukses" && hasil) {
    // Momen uang berpindah tangan: layar perayaan penuh — hijau + emas.
    return (
      <div className="rayakan" role="status">
        <svg className="cek" viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="6" aria-hidden="true">
          <circle cx="48" cy="48" r="41" strokeLinecap="round" />
          <path d="M30 50 L44 63 L67 36" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 ref={judulSuksesRef} tabIndex={-1} style={{ color: "#fff", margin: 0, fontSize: "1.4rem", outline: "none" }}>
          Penukaran berhasil!
        </h2>
        <div className="jumlah">{fmtRupiah(hasil.rupiah)}</div>
        <p className="pesan">
          {hasil.poin} poin kamu sudah dicairkan. Terima uang tunainya dari ops, ya. Terima kasih sudah menabung
          sampah!
        </p>
        <Link href="/warga" className="btn di-hijau" style={{ maxWidth: 320 }}>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {!verified ? (
        <VerifikasiBanner email={email} />
      ) : (
        <>
          <p className="muted">Arahkan kamera ke QR di layar ops.</p>
          {/* video selalu ter-mount saat scan/proses agar kamera tidak berkedip */}
          <video ref={videoRef} className="scan-video" muted playsInline />
          <p aria-live="polite" style={{ margin: fase === "proses" || error ? undefined : 0 }}>
            {fase === "proses" && <span className="sukses">QR terbaca, memproses penukaran…</span>}
            {error && <span className="error">{error}</span>}
          </p>
          {error && (
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
          )}
        </>
      )}
    </div>
  );
}
