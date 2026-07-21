import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import { kontribusiWarga } from "@/lib/kontribusi";
import AppHeader from "@/components/AppHeader";

export default async function KontribusiPage() {
  const u = await requireRole("warga");
  const k = await kontribusiWarga(u.id);
  const maxBerat = Math.max(0.001, ...k.tren.map((t) => t.beratKg));
  const maxJenis = Math.max(0.001, ...k.perJenis.map((j) => j.beratKg));

  return (
    <>
      <AppHeader judul="Kontribusiku" aksi={<Link href="/warga" className="tautan-sentuh">← Beranda</Link>} />
      <main className="container">
        {k.totalSetoran === 0 ? (
          <div className="kartu-perhatian">
            <svg className="ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong>Belum ada kontribusi.</strong>
              <p className="muted" style={{ margin: "4px 0 0" }}>
                Bawa sampah terpilahmu ke petugas bank sampah. Setelah setoran pertama, grafikmu muncul di sini.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat">
                <div className="label">Total poin</div>
                <div className="nilai emas">{k.totalPoin.toLocaleString("id-ID")}</div>
              </div>
              <div className="stat">
                <div className="label">Total sampah</div>
                <div className="nilai">
                  {k.totalBeratKg.toLocaleString("id-ID")} <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>kg</span>
                </div>
              </div>
              <div className="stat">
                <div className="label">Jenis favorit</div>
                <div className="nilai" style={{ fontSize: "1.25rem" }}>{k.jenisFavorit ?? "-"}</div>
              </div>
              <div className="stat">
                <div className="label">Jumlah setoran</div>
                <div className="nilai">{k.totalSetoran.toLocaleString("id-ID")}</div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: "1.02rem" }}>Sampah per bulan (kg)</h2>
              <div className="bagan" role="img" aria-label="Bagan berat sampah enam bulan terakhir">
                {k.tren.map((t) => (
                  <div className="kolom" key={t.label}>
                    <span className="val">{t.beratKg > 0 ? t.beratKg.toLocaleString("id-ID") : ""}</span>
                    <div className="batang" style={{ height: `${Math.round((t.beratKg / maxBerat) * 100)}%` }} />
                    <span className="cap">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: "1.02rem" }}>Per jenis sampah</h2>
              {k.perJenis.map((j) => (
                <div className="jenis-baris" key={j.nama}>
                  <div className="baris">
                    <strong>{j.nama}</strong>
                    <span className="muted">
                      {j.beratKg.toLocaleString("id-ID")} kg • <span className="emas">{j.poin.toLocaleString("id-ID")} poin</span>
                    </span>
                  </div>
                  <div className="isi">
                    <span style={{ width: `${Math.round((j.beratKg / maxJenis) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
