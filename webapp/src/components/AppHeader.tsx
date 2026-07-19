import type { ReactNode } from "react";

/** Bidang hijau identitas di puncak layar ter-autentikasi.
    `children` opsional utk konten tambahan di dalam bidang yang sama (mis. panel saldo). */
export default function AppHeader({
  judul,
  aksi,
  kelas,
  children,
}: {
  judul: string;
  aksi?: ReactNode;
  kelas?: string;
  children?: ReactNode;
}) {
  return (
    <header className={`markas${kelas ? ` ${kelas}` : ""}`}>
      <div className="container">
        <div className="baris">
          <h1>{judul}</h1>
          {aksi}
        </div>
        {children}
      </div>
    </header>
  );
}
