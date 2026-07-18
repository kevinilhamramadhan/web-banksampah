"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container kolom-tengah" style={{ minHeight: "100dvh", justifyContent: "center" }}>
      <div className="card kolom-tengah" style={{ padding: 32 }}>
        <h2>Terjadi kesalahan. Coba lagi.</h2>
        <button className="btn" style={{ marginTop: 16 }} onClick={reset}>
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
