import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import AppHeader from "@/components/AppHeader";
import SetoranForm from "@/components/SetoranForm";

export default async function OpsSetoranPage() {
  await requireRole("ops");
  return (
    <>
      <AppHeader judul="Input Setoran" aksi={<Link href="/ops">← Beranda</Link>} />
      <main className="container">
        <SetoranForm />
      </main>
    </>
  );
}
