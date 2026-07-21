import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

/* Cangkang auth: panel brand hijau di desktop, kartu form terpusat di semua ukuran. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-split">
      <aside className="auth-panel gradient-bg blob-container" style={{ position: "relative", zIndex: 1, overflow: "hidden" }}>
        <div className="merek">
          <Image src="/icon-192.png" alt="" width={44} height={44} />
          Bank Sampah
        </div>
        <p className="tagline">Ubah sampah jadi tabungan untuk warga.</p>
        <p className="catatan">Setor sampah, kumpulkan poin, cairkan jadi uang tunai di bank sampah.</p>
      </aside>
      <div className="auth-isi">
        <div className="auth-kartu glass-panel">
          <Link href="/" className="auth-merek">
            <Image src="/icon-192.png" alt="" width={36} height={36} />
            Bank Sampah
          </Link>
          {children}
          <p className="auth-legal">
            <Link href="/tentang">Tentang</Link> · <Link href="/privasi">Privasi</Link> ·{" "}
            <Link href="/ketentuan">Ketentuan</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
