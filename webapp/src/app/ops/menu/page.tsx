import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import AppHeader from "@/components/AppHeader";

const IKON = {
  analitik: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
    </svg>
  ),
  laporan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" strokeLinejoin="round" />
      <path d="M14 3v5h5M12 12v5m0 0-2-2m2 2 2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  jenis: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h10" strokeLinecap="round" />
      <circle cx="18" cy="18" r="3" />
    </svg>
  ),
  peringkat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const TAUTAN = [
  { href: "/ops/analitik", ikon: "analitik", judul: "Analitik & tren", ket: "Total poin, tren bulanan, kontribusi per jenis" },
  { href: "/ops/laporan", ikon: "laporan", judul: "Laporan CSV (LPJ)", ket: "Unduh rekap setoran & penukaran per periode" },
  { href: "/ops/jenis-sampah", ikon: "jenis", judul: "Jenis sampah & tarif", ket: "Atur jenis yang diterima dan poin per kilogram" },
  { href: "/warga/peringkat", ikon: "peringkat", judul: "Peringkat penabung", ket: "Penabung teratas kuartal berjalan" },
] as const;

export default async function OpsMenuPage() {
  await requireRole("ops");
  return (
    <>
      <AppHeader judul="Menu" />
      <main className="container">
        <nav className="menu-list" aria-label="Alat pengelolaan">
          {TAUTAN.map((t) => (
            <Link key={t.href} href={t.href} className="menu-item">
              <span className="ikon">{IKON[t.ikon]}</span>
              <span>
                <span className="judul">{t.judul}</span>
                <br />
                <span className="ket">{t.ket}</span>
              </span>
              <svg
                className="lanjut"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </nav>
      </main>
    </>
  );
}
