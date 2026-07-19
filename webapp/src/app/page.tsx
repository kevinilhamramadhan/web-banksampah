"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InstallPrompt from "@/components/InstallPrompt";
import { getPilihan, isIos, isStandalone, shouldShowWelcome, simpanPilihan, useCanInstall } from "@/lib/install";

export default function Home() {
  const router = useRouter();
  const [siap, setSiap] = useState(false); // sudah tahu hasil pengecekan di client
  const [tampil, setTampil] = useState(false);
  const [tampilInstall, setTampilInstall] = useState(false);
  const canInstall = useCanInstall();

  useEffect(() => {
    // Cek localStorage/matchMedia hanya di client (bukan saat SSR render).
    if (shouldShowWelcome(isStandalone(), getPilihan())) {
      setTampil(true);
    } else {
      router.replace("/login");
    }
    setSiap(true);
  }, [router]);

  if (!siap || !tampil) return null; // render nothing sementara / saat redirect

  const lanjutBrowser = () => {
    simpanPilihan("browser");
    router.replace("/login");
  };

  const bisaTawariInstall = canInstall || isIos();

  return (
    <div className="selamat-datang">
      <img src="/icon-192.png" alt="" width={104} height={104} style={{ borderRadius: 26 }} />
      <h1>Bank Sampah</h1>
      <p style={{ color: "oklch(1 0 0 / 0.88)", maxWidth: "34ch" }}>
        Setor sampah, kumpulkan poin, tukarkan jadi uang tunai.
      </p>

      {!tampilInstall ? (
        <div style={{ width: "100%", maxWidth: 360, display: "grid", gap: 12 }}>
          <button className="btn di-hijau" onClick={lanjutBrowser}>
            Gunakan di Browser
          </button>
          {bisaTawariInstall && (
            <button className="btn sekunder di-hijau" onClick={() => setTampilInstall(true)}>
              Install Aplikasi
            </button>
          )}
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: 360, display: "grid", gap: 12 }}>
          <div className="card">
            <h2 style={{ fontSize: "1.02rem", color: "#fff" }}>Keuntungan install</h2>
            <p className="muted" style={{ marginBottom: 0 }}>
              Buka langsung dari layar utama, tampilan layar penuh, dan lebih cepat dibuka.
            </p>
          </div>
          <InstallPrompt onInstalled={() => simpanPilihan("install")} />
          <button className="btn sekunder di-hijau" onClick={lanjutBrowser}>
            Lanjut di browser saja
          </button>
        </div>
      )}
    </div>
  );
}
