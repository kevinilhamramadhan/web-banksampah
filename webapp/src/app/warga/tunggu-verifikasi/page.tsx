import Image from "next/image";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session-next";
import VerifikasiBanner from "@/components/VerifikasiBanner";
import TombolKeluar from "@/components/TombolKeluar";

export default async function TungguVerifikasiPage() {
  // allowUnverified = true agar halaman ini dapat diakses oleh warga yang belum verifikasi
  const user = await requireRole("warga", true);

  // Jika email sudah terverifikasi, alihkan langsung ke beranda warga
  if (user.emailVerifiedAt) {
    redirect("/warga");
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--permukaan)", padding: "24px 16px" }}>
      <div className="container" style={{ maxWidth: 540, margin: "0 auto", paddingTop: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 20px",
              background: "var(--kartu)",
              borderRadius: 999,
              boxShadow: "0 4px 14px oklch(0 0 0 / 0.05)",
            }}
          >
            <Image src="/icon-192.png" alt="" width={32} height={32} style={{ borderRadius: 8 }} />
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Bank Sampah Digital</span>
          </div>
        </div>

        <main className="card" style={{ padding: 24, borderRadius: "var(--radius-besar)" }}>
          <VerifikasiBanner email={user.email} />
        </main>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <TombolKeluar kelas="btn sekunder" />
        </div>
      </div>
    </div>
  );
}
