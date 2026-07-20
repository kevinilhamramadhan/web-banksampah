import Link from "next/link";
import { requireRole } from "@/lib/session-next";
import { analitikOps } from "@/lib/analitik";
import { fmtRupiah } from "@/lib/constants";
import AppHeader from "@/components/AppHeader";

export default async function OpsAnalitikPage() {
  await requireRole("ops");
  const a = await analitikOps();
  const maxPoin = Math.max(1, ...a.tren.map((t) => t.poin));
  const maxJenisPoin = Math.max(1, ...a.perJenis.map((j) => j.poin));

  return (
    <>
      <AppHeader judul="Analitik" aksi={<Link href="/ops">← Beranda</Link>} />
      <main className="container lebar">
        <div className="stat-grid">
          <div className="stat">
            <div className="label">Total poin terkumpul</div>
            <div className="nilai emas">{a.totalPoinTerkumpul.toLocaleString("id-ID")}</div>
          </div>
          <div className="stat">
            <div className="label">Total dana dicairkan</div>
            <div className="nilai emas">{fmtRupiah(a.totalRupiahDicairkan)}</div>
          </div>
          <div className="stat">
            <div className="label">Total setoran</div>
            <div className="nilai">{a.totalSetoran.toLocaleString("id-ID")}</div>
          </div>
          <div className="stat">
            <div className="label">Total berat</div>
            <div className="nilai">
              {a.totalBeratKg.toLocaleString("id-ID")} <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>kg</span>
            </div>
          </div>
          <div className="stat">
            <div className="label">Warga aktif (30 hari)</div>
            <div className="nilai">{a.wargaAktif30Hari.toLocaleString("id-ID")}</div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.02rem" }}>Poin masuk per bulan</h2>
          {a.totalSetoran === 0 ? (
            <p className="muted">Belum ada setoran untuk ditampilkan.</p>
          ) : (
            <div className="bagan" role="img" aria-label="Bagan poin masuk enam bulan terakhir">
              {a.tren.map((t) => (
                <div className="kolom" key={t.label}>
                  <span className="val">{t.poin > 0 ? t.poin : ""}</span>
                  <div className="batang" style={{ height: `${Math.round((t.poin / maxPoin) * 100)}%` }} />
                  <span className="cap">{t.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.02rem" }}>Kontribusi per jenis sampah</h2>
          {a.perJenis.length === 0 ? (
            <p className="muted">Belum ada data jenis sampah.</p>
          ) : (
            a.perJenis.map((j) => (
              <div className="jenis-baris" key={j.nama}>
                <div className="baris">
                  <strong>{j.nama}</strong>
                  <span className="muted">
                    {j.beratKg.toLocaleString("id-ID")} kg • <span className="emas">{j.poin.toLocaleString("id-ID")} poin</span>
                  </span>
                </div>
                <div className="isi">
                  <span style={{ width: `${Math.round((j.poin / maxJenisPoin) * 100)}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
