import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import PenukaranForm from "@/components/PenukaranForm";

export default async function OpsPenukaranPage() {
  await requireRole("ops");
  return (
    <div className="container">
      <div className="baris" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Penukaran Poin</h1>
        <Link href="/ops">← Beranda</Link>
      </div>
      <PenukaranForm />
    </div>
  );
}
