import Link from "next/link";
import type { ReactNode } from "react";

// Cangkang untuk halaman informasi publik (tentang / privasi / ketentuan).
export default function InfoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="markas">
        <div className="container">
          <div className="baris">
            <h1 style={{ fontSize: "1.15rem" }}>
              <Link href="/">Bank Sampah</Link>
            </h1>
            <Link href="/">← Kembali</Link>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
