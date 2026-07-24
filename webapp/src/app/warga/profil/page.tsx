import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import AppHeader from "@/components/AppHeader";
import PengaturanAkun from "@/components/PengaturanAkun";
import TombolKeluar from "@/components/TombolKeluar";

export default async function ProfilPage() {
  const u = await requireRole("warga");
  return (
    <>
      <AppHeader judul="Profil" />
      <main className="container">
        <PengaturanAkun awal={{ nama: u.nama, noHp: u.noHp, alamat: u.alamat, email: u.email }} />

        <div className="card" style={{ marginTop: 20 }}>
          <div className="baris" style={{ flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: "1.02rem", margin: 0 }}>Pengaturan Aplikasi</h2>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.88rem" }}>
                Atur tema tampilan, opsi instalasi PWA, dan bantuan.
              </p>
            </div>
            <Link href="/warga/pengaturan" className="btn sekunder">
              Buka Pengaturan
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 28, paddingBottom: 24 }}>
          <TombolKeluar kelas="btn bahaya" />
        </div>
      </main>
    </>
  );
}
