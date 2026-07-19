"use client";
import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";

/** Keluar dgn konfirmasi dua-langkah — mencegah tap tak sengaja di posisi header. */
export default function TombolKeluar() {
  const [konfirmasi, setKonfirmasi] = useState(false);

  useEffect(() => {
    if (!konfirmasi) return;
    const t = setTimeout(() => setKonfirmasi(false), 4000);
    return () => clearTimeout(t);
  }, [konfirmasi]);

  if (!konfirmasi) {
    return (
      <button className="btn kecil bahaya" onClick={() => setKonfirmasi(true)}>
        Keluar
      </button>
    );
  }
  return (
    <form action={logoutAction} className="baris" style={{ gap: 8 }}>
      <button className="btn kecil bahaya" type="submit" autoFocus>
        Ya, keluar
      </button>
      <button className="btn kecil sekunder di-hijau" type="button" onClick={() => setKonfirmasi(false)}>
        Batal
      </button>
    </form>
  );
}
