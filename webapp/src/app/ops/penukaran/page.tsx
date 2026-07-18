import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import AppHeader from "@/components/AppHeader";
import PenukaranForm from "@/components/PenukaranForm";

export default async function OpsPenukaranPage() {
  await requireRole("ops");
  return (
    <>
      <AppHeader judul="Penukaran Poin" aksi={<Link href="/ops">← Beranda</Link>} />
      <main className="container">
        <PenukaranForm />
      </main>
    </>
  );
}
