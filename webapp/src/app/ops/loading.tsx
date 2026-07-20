// Skeleton saat dashboard ops menunggu data server.
export default function Loading() {
  return (
    <div aria-hidden="true">
      <div className="markas">
        <div className="container">
          <div className="skeleton-baris" style={{ height: 24, width: "45%", margin: "4px 0" }} />
        </div>
      </div>
      <div className="container lebar">
        <div className="skeleton-baris" style={{ height: 44, marginBottom: 16 }} />
        <div className="skeleton-baris" />
        <div className="skeleton-baris" />
        <div className="skeleton-baris" />
      </div>
    </div>
  );
}
