import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import AppHeader from "@/components/AppHeader";
import TombolTema from "@/components/TombolTema";
import InstallPengaturan from "@/components/InstallPengaturan";
import TombolKeluar from "@/components/TombolKeluar";

export default async function PengaturanPage() {
  await requireRole("warga");
  return (
    <>
      <AppHeader judul="Pengaturan" />
      <main className="container">
        <div className="card">
          <h2 style={{ fontSize: "1.02rem" }}>Tampilan</h2>
          <p className="muted" style={{ marginTop: 0 }}>Pilih mode terang, gelap, atau ikuti setelan perangkat.</p>
          <TombolTema />
        </div>

        <InstallPengaturan />

        <div className="card">
          <h2 style={{ fontSize: "1.02rem" }}>Tentang &amp; bantuan</h2>
          <p style={{ display: "grid", gap: 8, margin: 0 }}>
            <Link href="/tentang">Tentang aplikasi</Link>
            <Link href="/privasi">Kebijakan privasi</Link>
            <Link href="/ketentuan">Syarat &amp; ketentuan</Link>
          </p>
        </div>

        <div style={{ marginTop: 8 }}>
          <TombolKeluar />
        </div>
      </main>
    </>
  );
}
