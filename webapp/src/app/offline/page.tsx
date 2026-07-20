"use client";

// Halaman fallback saat navigasi gagal karena offline (disajikan service worker).
// Sengaja statis & non-sensitif — tidak menampilkan data saldo/riwayat apa pun.
export default function Offline() {
  return (
    <div className="selamat-datang">
      <svg
        width="72"
        height="72"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ color: "var(--emas)" }}
      >
        <path d="M1 1l22 22" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <h1>Kamu sedang offline</h1>
      <p style={{ color: "oklch(1 0 0 / 0.88)", maxWidth: "34ch" }}>
        Sambungan internet terputus. Data saldo dan riwayat butuh koneksi agar tetap
        akurat, jadi tidak kami tampilkan saat offline.
      </p>
      <div style={{ width: "100%", maxWidth: 320 }}>
        <button className="btn di-hijau" onClick={() => location.reload()}>
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
