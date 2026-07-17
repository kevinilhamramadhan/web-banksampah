import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import SetoranForm from "@/components/SetoranForm";

export default async function OpsSetoranPage() {
  await requireRole("ops");
  return (
    <div className="container">
      <div className="baris" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Input Setoran</h1>
        <Link href="/ops">← Beranda</Link>
      </div>
      <SetoranForm />
    </div>
  );
}
