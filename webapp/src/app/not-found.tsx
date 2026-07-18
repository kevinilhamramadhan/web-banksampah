import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container kolom-tengah" style={{ minHeight: "100dvh", justifyContent: "center" }}>
      <div className="card kolom-tengah" style={{ padding: 32 }}>
        <h2>Halaman tidak ditemukan.</h2>
        <Link href="/" style={{ width: "100%", textDecoration: "none" }}>
          <button className="btn" style={{ marginTop: 16 }}>
            Kembali ke Beranda
          </button>
        </Link>
      </div>
    </div>
  );
}
