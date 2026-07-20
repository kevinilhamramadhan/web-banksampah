"use client";
import { useEffect } from "react";

// Mendaftarkan service worker sekali saat aplikasi dimuat di client.
// Tanpa UI — hanya efek samping registrasi.
export default function DaftarSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const daftar = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          /* registrasi gagal (mis. dev http tanpa https): abaikan diam-diam */
        });
    };
    // Tunggu load agar tidak bersaing dengan render awal.
    if (document.readyState === "complete") daftar();
    else {
      window.addEventListener("load", daftar);
      return () => window.removeEventListener("load", daftar);
    }
  }, []);

  return null;
}
