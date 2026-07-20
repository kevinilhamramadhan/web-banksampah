import { requireRole } from "@/lib/session-next";
import AppHeader from "@/components/AppHeader";
import PenukaranForm from "@/components/PenukaranForm";

export default async function OpsPenukaranPage() {
  await requireRole("ops");
  return (
    <>
      <AppHeader judul="Penukaran Poin" />
      <main className="container">
        <PenukaranForm />
      </main>
    </>
  );
}
