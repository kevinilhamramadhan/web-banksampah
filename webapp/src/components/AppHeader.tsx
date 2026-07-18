import type { ReactNode } from "react";

/** Bidang hijau identitas di puncak layar ter-autentikasi. */
export default function AppHeader({ judul, aksi }: { judul: string; aksi?: ReactNode }) {
  return (
    <header className="markas">
      <div className="container baris">
        <h1>{judul}</h1>
        {aksi}
      </div>
    </header>
  );
}
