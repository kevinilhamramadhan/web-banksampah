import type { MetadataRoute } from "next";

// Manifest PWA (typed). Menggantikan public/manifest.webmanifest — Next.js
// menyajikannya otomatis di /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Bank Sampah Digital",
    short_name: "Bank Sampah",
    description: "Pantau poin sampah dan tukar poin jadi uang",
    lang: "id",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait",
    start_url: "/",
    scope: "/",
    background_color: "#F6FAF0",
    theme_color: "#2B6B3F",
    categories: ["finance", "lifestyle", "utilities"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Scan QR Penukaran",
        short_name: "Scan QR",
        description: "Pindai QR untuk mencairkan poin",
        url: "/warga/scan",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Setor Sampah",
        short_name: "Setor",
        description: "Catat setoran sampah warga (petugas)",
        url: "/ops/setoran",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Peringkat Penabung",
        short_name: "Peringkat",
        description: "Lihat peringkat penabung kuartal ini",
        url: "/warga/peringkat",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
