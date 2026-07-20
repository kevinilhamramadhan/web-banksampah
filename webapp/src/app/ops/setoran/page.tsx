import { requireRole } from "@/lib/session-next";
import { listJenisSampah } from "@/lib/jenis-sampah";
import AppHeader from "@/components/AppHeader";
import SetoranForm from "@/components/SetoranForm";

export default async function OpsSetoranPage() {
  await requireRole("ops");
  const jenis = await listJenisSampah(true);
  return (
    <>
      <AppHeader judul="Input Setoran" />
      <main className="container">
        <SetoranForm jenis={jenis.map((j) => ({ id: j.id, nama: j.nama, tarifPoinPerKg: j.tarifPoinPerKg }))} />
      </main>
    </>
  );
}
