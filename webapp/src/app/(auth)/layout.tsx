import Link from "next/link";
import type { ReactNode } from "react";

/* Pita brand hijau di atas semua halaman auth — identitas konsisten sejak pintu masuk. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="markas">
        <div className="container" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <Link href="/" style={{ textDecoration: "none", fontWeight: 700, fontSize: "1.05rem" }}>
            🍃 Bank Sampah KKN
          </Link>
        </div>
      </div>
      {children}
    </>
  );
}
