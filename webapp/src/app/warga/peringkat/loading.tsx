// Skeleton saat peringkat kuartal menunggu agregasi server.
export default function Loading() {
  return (
    <div aria-hidden="true">
      <div className="markas">
        <div className="container">
          <div className="skeleton-baris" style={{ height: 24, width: "50%", margin: "4px 0" }} />
        </div>
      </div>
      <div className="container">
        <div className="skeleton-baris" />
        <div className="skeleton-baris" />
        <div className="skeleton-baris" />
        <div className="skeleton-baris" />
        <div className="skeleton-baris" />
      </div>
    </div>
  );
}
