import { requireRole } from "@/lib/session-next";
import { analitikOps } from "@/lib/analitik";
import { fmtRupiah } from "@/lib/constants";
import AppHeader from "@/components/AppHeader";

export default async function OpsAnalitikPage() {
  await requireRole("ops");
  const a = await analitikOps();
  const maxPoin = Math.max(1, ...a.tren.map((t) => t.poin));
  const maxJenis = Math.max(0.001, ...a.perJenis.map((j) => j.beratKg));
  const nf = (n: number) => n.toLocaleString("id-ID");

  return (
    <>
      <AppHeader judul="Analitik" />
      <main className="container">
        {a.totalSetoran === 0 ? (
          <p className="muted" style={{ marginTop: 20 }}>
            Belum ada setoran yang tercatat. Angka dan tren akan muncul di sini setelah setoran pertama.
          </p>
        ) : (
          <>
            {/* Ringkasan naratif — sengaja bukan hamparan kartu statistik. */}
            <p className="sorot">
              Warga sudah menabung <strong className="emas">{nf(a.totalPoinTerkumpul)} poin</strong> dari{" "}
              <strong>{nf(a.totalBeratKg)} kg</strong> sampah lewat <strong>{nf(a.totalSetoran)} setoran</strong>.
              Sebanyak <strong className="emas">{fmtRupiah(a.totalRupiahDicairkan)}</strong> sudah dicairkan, dan{" "}
              <strong>{nf(a.wargaAktif30Hari)} warga</strong> menyetor dalam 30 hari terakhir.
            </p>

            <section aria-labelledby="tren">
              <h2 id="tren" style={{ fontSize: "1.05rem" }}>
                Poin masuk per bulan
              </h2>
              <div className="bagan" role="img" aria-label="Bagan poin masuk enam bulan terakhir">
                {a.tren.map((t) => (
                  <div className="kolom" key={t.label}>
                    <span className="val">{t.poin > 0 ? nf(t.poin) : ""}</span>
                    <div
                      className={`batang${t.poin === 0 ? " nol" : ""}`}
                      style={{ height: t.poin === 0 ? 3 : `${Math.round((t.poin / maxPoin) * 100)}%` }}
                    />
                    <span className="cap">{t.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="jenis" style={{ marginTop: 32 }}>
              <h2 id="jenis" style={{ fontSize: "1.05rem", marginBottom: 2 }}>
                Kontribusi per jenis sampah
              </h2>
              {/* Bar menyandikan berat, sedangkan poin ikut ditampilkan — sebutkan agar
                  jenis bertarif tinggi (poin besar, berat kecil) tidak terbaca janggal. */}
              <p className="muted" style={{ marginBottom: 12 }}>
                Panjang bar mengikuti berat (kg).
              </p>
              {a.perJenis.map((j) => (
                <div className="jenis-baris" key={j.nama}>
                  <div className="baris">
                    <strong>{j.nama}</strong>
                    <span className="muted">
                      {nf(j.beratKg)} kg · <span className="emas">{nf(j.poin)} poin</span>
                    </span>
                  </div>
                  <div className="isi">
                    <span style={{ width: `${Math.round((j.beratKg / maxJenis) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </>
  );
}
