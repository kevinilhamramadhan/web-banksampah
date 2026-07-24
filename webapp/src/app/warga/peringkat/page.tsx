import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session-next";
import { peringkatKuartal } from "@/lib/peringkat";
import AppHeader from "@/components/AppHeader";

/* Terbuka utk warga DAN ops (read-only) — sama seperti leaderboard app Android lama. */
export default async function PeringkatPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { musimLabel, top, saya } = await peringkatKuartal(user.role === "warga" ? user.id : undefined);
  const sayaDiLuarTop = saya && !top.some((t) => t.wargaId === saya.wargaId);

  return (
    <>
      <AppHeader judul="Peringkat Penabung">
        <p className="label" style={{ margin: "4px 0 0" }}>
          {musimLabel}, poin dari setoran sampah kuartal ini
        </p>
      </AppHeader>

      <main className="container">
        {top.length === 0 ? (
          <p className="muted" style={{ marginTop: 16 }}>
            Belum ada setoran kuartal ini, jadilah penabung pertama!
          </p>
        ) : (
          <ol className="peringkat" aria-label={`Peringkat penabung ${musimLabel}`}>
            {top.map((t) => (
              <li key={t.wargaId} className={`riwayat-item baris${t.wargaId === saya?.wargaId ? " baris-saya" : ""}`}>
                <span className="baris" style={{ justifyContent: "flex-start", gap: 12 }}>
                  <span className="posisi">{t.posisi}</span>
                  <span>
                    {t.nama}
                    {t.wargaId === saya?.wargaId && <span className="muted"> (kamu)</span>}
                  </span>
                </span>
                <strong className="emas">{t.poin.toLocaleString("id-ID")} poin</strong>
              </li>
            ))}
            {sayaDiLuarTop && (
              <li className="riwayat-item baris baris-saya" style={{ marginTop: 8 }}>
                <span className="baris" style={{ justifyContent: "flex-start", gap: 12 }}>
                  <span className="posisi">{saya.posisi}</span>
                  <span>
                    {saya.nama}
                    <span className="muted"> (kamu)</span>
                  </span>
                </span>
                <strong className="emas">{saya.poin.toLocaleString("id-ID")} poin</strong>
              </li>
            )}
          </ol>
        )}
        {user.role === "warga" && !saya && top.length > 0 && (
          <p className="muted">Kamu belum menyetor kuartal ini, setor sampah untuk masuk peringkat!</p>
        )}
      </main>
    </>
  );
}
