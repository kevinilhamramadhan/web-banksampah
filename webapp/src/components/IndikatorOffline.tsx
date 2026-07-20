"use client";
import { useOnline } from "@/lib/useOnline";

// Banner tipis lekat di atas layar saat koneksi terputus.
export default function IndikatorOffline() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="banner-offline" role="status">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M1 1l22 22" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <span>Kamu sedang offline</span>
    </div>
  );
}
