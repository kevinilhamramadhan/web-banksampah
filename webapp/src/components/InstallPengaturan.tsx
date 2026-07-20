"use client";
import { useEffect, useState } from "react";
import { isStandalone, promptInstall, useCanInstall } from "@/lib/install";

/**
 * Kartu install PWA di halaman Pengaturan.
 * Selalu tampil — tidak pernah return null.
 */
export default function InstallPengaturan() {
  const canInstall = useCanInstall();
  const [standalone, setStandalone] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [sukses, setSukses] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
  }, []);

  return (
    <div className="card">
      <h2 style={{ fontSize: "1.02rem" }}>Install Aplikasi</h2>

      {standalone ? (
        <div className="install-status terinstall">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>Aplikasi sudah terinstall di perangkat ini.</span>
        </div>
      ) : sukses ? (
        <div className="install-status terinstall">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>Berhasil! Aplikasi sedang diinstall.</span>
        </div>
      ) : (
        <>
          <p className="muted" style={{ marginTop: 0 }}>
            Akses langsung dari layar utama, lebih cepat dan bisa offline.
          </p>
          <button
            className="btn"
            disabled={sibuk || !canInstall}
            onClick={async () => {
              setSibuk(true);
              try {
                await promptInstall();
                setSukses(true);
              } catch {
                // user menolak
              } finally {
                setSibuk(false);
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {sibuk ? "Menginstall…" : "Install Aplikasi"}
          </button>
          {!canInstall && (
            <p className="muted" style={{ marginTop: 8, marginBottom: 0, fontSize: "0.82rem" }}>
              Buka lewat Chrome atau Safari untuk bisa install.
            </p>
          )}
        </>
      )}
    </div>
  );
}
