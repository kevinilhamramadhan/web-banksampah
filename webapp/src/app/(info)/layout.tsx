import Link from "next/link";
import type { ReactNode } from "react";

// Cangkang untuk halaman informasi publik (tentang / privasi / ketentuan).
export default function InfoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="markas">
        <div className="container">
          {/* Merek di sini adalah navigasi, bukan judul halaman — kalau dijadikan <h1>
              setiap halaman info punya dua h1 dan hierarki heading jadi rusak. */}
          <div className="baris">
            <Link href="/" className="merek-info">
              Bank Sampah
            </Link>
            <Link href="/" className="tautan-sentuh">
              ← Kembali
            </Link>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
