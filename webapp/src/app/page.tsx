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
    <div className="container kolom-tengah" style={{ minHeight: "100dvh", justifyContent: "center" }}>
      <img src="/icon-192.png" alt="" width={96} height={96} style={{ borderRadius: 24 }} />
      <h1 style={{ textAlign: "center" }}>Bank Sampah KKN</h1>
      <p className="muted" style={{ textAlign: "center" }}>
        Pantau poin sampahmu dan tukarkan jadi uang tunai.
      </p>

      {!tampilInstall ? (
        <div style={{ width: "100%", display: "grid", gap: 12 }}>
          <button className="btn" onClick={lanjutBrowser}>
            Gunakan di Browser
          </button>
          {bisaTawariInstall && (
            <button className="btn sekunder" onClick={() => setTampilInstall(true)}>
              Install Aplikasi
            </button>
          )}
        </div>
      ) : (
        <div style={{ width: "100%", display: "grid", gap: 12 }}>
          <div className="card">
            <h3>Keuntungan install</h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              Buka langsung dari layar utama, tampilan layar penuh, dan lebih cepat dibuka.
            </p>
          </div>
          <InstallPrompt onInstalled={() => simpanPilihan("install")} />
          <button className="btn sekunder" onClick={lanjutBrowser}>
            Lanjut di browser saja
          </button>
        </div>
      )}
    </div>
  );
}
