"use client";
import { useEffect } from "react";
// Side-effect: mendaftarkan listener beforeinstallprompt sedini mungkin
// agar event tidak terlewat di halaman mana pun.
import "@/lib/install";

// Mendaftarkan service worker sekali saat aplikasi dimuat di client.
// Tanpa UI — hanya efek samping registrasi.
export default function DaftarSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Di mode development, batalkan registrasi Service Worker agar tidak bentrok
    // dengan Hot Module Replacement (HMR) / Turbopack yang menyebabkan halaman terus reload.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      return;
    }

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
