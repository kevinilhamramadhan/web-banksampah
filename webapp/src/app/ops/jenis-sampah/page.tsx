import { requireRole } from "@/lib/session-next";
import { listJenisSampah } from "@/lib/jenis-sampah";
import AppHeader from "@/components/AppHeader";
import KelolaJenis from "@/components/KelolaJenis";

export default async function OpsJenisSampahPage() {
  await requireRole("ops");
  const rows = await listJenisSampah(false);
  return (
    <>
      <AppHeader judul="Jenis Sampah" />
      <main className="container">
        <p className="muted">
          Tarif menentukan poin per kilogram. Menonaktifkan jenis menyembunyikannya dari form
          setoran, tapi riwayat lama tetap utuh.
        </p>
        <KelolaJenis awal={rows.map((j) => ({ id: j.id, nama: j.nama, tarifPoinPerKg: j.tarifPoinPerKg, aktif: j.aktif }))} />
      </main>
    </>
  );
}
