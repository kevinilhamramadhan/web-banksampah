import { requireRole } from "@/lib/session-next";
import AppHeader from "@/components/AppHeader";
import PengaturanAkun from "@/components/PengaturanAkun";

export default async function ProfilPage() {
  const u = await requireRole("warga");
  return (
    <>
      <AppHeader judul="Profil" />
      <main className="container">
        <PengaturanAkun awal={{ nama: u.nama, noHp: u.noHp, alamat: u.alamat, email: u.email }} />
      </main>
    </>
  );
}
