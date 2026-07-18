"use client";
import { isStandalone, promptInstall, useCanInstall } from "@/lib/install";

/** Tombol install kecil di bawah dashboard warga — muncul hanya kalau browser mendukung dan belum standalone. */
export default function InstallButtonKecil() {
  const canInstall = useCanInstall();
  if (!canInstall || isStandalone()) return null;

  return (
    <button className="btn kecil sekunder" style={{ margin: "24px auto 0" }} onClick={() => void promptInstall()}>
      Install aplikasi di HP
    </button>
  );
}
