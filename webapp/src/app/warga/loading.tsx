// Skeleton saat dashboard warga menunggu data server (saldo + riwayat).
export default function Loading() {
  return (
    <div aria-hidden="true">
      <div className="saldo-panel">
        <div className="container">
          <div className="skeleton-baris" style={{ height: 18, width: "38%", margin: "4px 0" }} />
          <div className="skeleton-baris" style={{ height: 52, width: "62%", margin: "8px 0" }} />
        </div>
      </div>
      <div className="container">
        <div className="skeleton-baris" style={{ height: 44, marginBottom: 16 }} />
        <div className="skeleton-baris" />
        <div className="skeleton-baris" />
        <div className="skeleton-baris" />
      </div>
    </div>
  );
}
