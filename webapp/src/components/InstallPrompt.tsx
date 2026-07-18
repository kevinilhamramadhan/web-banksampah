"use client";
import { useState } from "react";
import { isIos, promptInstall, useCanInstall } from "@/lib/install";

/** Tombol/instruksi install PWA. Dipakai di Welcome dan (versi kecil) di halaman lain. */
export default function InstallPrompt({ onInstalled }: { onInstalled?: () => void }) {
  const canInstall = useCanInstall();
  const [sibuk, setSibuk] = useState(false);

  if (canInstall) {
    return (
      <button
        className="btn"
        disabled={sibuk}
        onClick={async () => {
          setSibuk(true);
          try {
            await promptInstall();
            onInstalled?.();
          } finally {
            setSibuk(false);
          }
        }}
      >
        Install Aplikasi
      </button>
    );
  }

  if (isIos()) {
    return (
      <div className="card">
        <h3>Cara install di iPhone/iPad</h3>
        <ol style={{ margin: 0, paddingLeft: "1.25rem" }}>
          <li>
            Ketuk tombol <strong>Bagikan</strong> <span aria-hidden>⎋</span> di bawah layar Safari
          </li>
          <li>
            Pilih <strong>Tambahkan ke Layar Utama</strong> <span aria-hidden>➕</span>
          </li>
          <li>
            Ketuk <strong>Tambah</strong>
          </li>
        </ol>
      </div>
    );
  }

  // Browser tidak mendukung install — jangan tampilkan apa-apa.
  return null;
}
