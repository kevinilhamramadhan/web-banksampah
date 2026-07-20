"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* Navigasi bawah ala aplikasi — pola PWA standar. Item tengah (aksi utama) ditonjolkan. */

const IKON = {
  beranda: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  scan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" strokeLinecap="round" />
      <path d="M4 12h16" strokeLinecap="round" />
    </svg>
  ),
  peringkat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  setoran: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3v12m0-12-4 4m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15" strokeLinecap="round" />
    </svg>
  ),
  penukaran: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <circle cx="12" cy="12.5" r="2.6" />
    </svg>
  ),
  pengaturan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  profil: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  ),
};

interface Item {
  href: string;
  label: string;
  ikon: keyof typeof IKON;
}

const MENU: Record<"warga" | "ops", Item[]> = {
  warga: [
    { href: "/warga", label: "Beranda", ikon: "beranda" },
    { href: "/warga/peringkat", label: "Peringkat", ikon: "peringkat" },
    { href: "/warga/scan", label: "Scan", ikon: "scan" },
    { href: "/warga/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
    { href: "/warga/profil", label: "Profil", ikon: "profil" },
  ],
  ops: [
    { href: "/ops", label: "Beranda", ikon: "beranda" },
    { href: "/ops/setoran", label: "Setoran", ikon: "setoran" },
    { href: "/ops/penukaran", label: "Penukaran", ikon: "penukaran" },
  ],
};

export default function AppNav({ peran }: { peran: "warga" | "ops" }) {
  const pathname = usePathname();
  return (
    <nav className="nav-bawah" aria-label="Navigasi utama">
      {MENU[peran].map((item) => {
        const aktif = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item${aktif ? " aktif" : ""}`}
            aria-current={aktif ? "page" : undefined}
          >
            <span className="nav-ikon">{IKON[item.ikon]}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
