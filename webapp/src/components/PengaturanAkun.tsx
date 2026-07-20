"use client";
import { useActionState } from "react";
import { updateProfilAction, gantiPasswordAction, type ProfilState } from "@/lib/actions/profil";

export default function PengaturanAkun({
  awal,
}: {
  awal: { nama: string; noHp: string; alamat: string; email: string };
}) {
  const [pState, pAction, pPending] = useActionState<ProfilState, FormData>(updateProfilAction, {});
  const [wState, wAction, wPending] = useActionState<ProfilState, FormData>(gantiPasswordAction, {});

  return (
    <>
      <div className="card">
        <h2 style={{ fontSize: "1.02rem" }}>Data diri</h2>
        <form action={pAction}>
          <label htmlFor="nama">Nama lengkap</label>
          <input id="nama" name="nama" className="input" defaultValue={awal.nama} required maxLength={100} autoComplete="name" />
          <label htmlFor="noHp">No. HP</label>
          <input id="noHp" name="noHp" className="input" type="tel" defaultValue={awal.noHp} required autoComplete="tel" />
          <label htmlFor="alamat">Alamat / RT-RW</label>
          <input id="alamat" name="alamat" className="input" defaultValue={awal.alamat} required />
          <label htmlFor="email">Email</label>
          <input id="email" className="input" defaultValue={awal.email} disabled />
          <p className="muted" style={{ margin: "6px 0 0", fontSize: "0.82rem" }}>
            Email tidak bisa diubah di sini.
          </p>
          <p aria-live="polite" style={{ margin: pState.error || pState.sukses ? "8px 0 0" : 0 }}>
            {pState.error && <span className="error">{pState.error}</span>}
            {pState.sukses && <span className="sukses">{pState.sukses}</span>}
          </p>
          <button className="btn" type="submit" disabled={pPending} style={{ marginTop: 16 }}>
            {pPending ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.02rem" }}>Ganti password</h2>
        <form action={wAction}>
          <label htmlFor="lama">Password lama</label>
          <input id="lama" name="lama" className="input" type="password" autoComplete="current-password" required />
          <label htmlFor="baru">Password baru</label>
          <input id="baru" name="baru" className="input" type="password" autoComplete="new-password" required minLength={6} aria-describedby="ket-baru" />
          <p id="ket-baru" className="muted" style={{ margin: "6px 0 0", fontSize: "0.82rem" }}>
            Minimal 6 karakter. Semua perangkat lain akan keluar otomatis.
          </p>
          <p aria-live="polite" style={{ margin: wState.error || wState.sukses ? "8px 0 0" : 0 }}>
            {wState.error && <span className="error">{wState.error}</span>}
            {wState.sukses && <span className="sukses">{wState.sukses}</span>}
          </p>
          <button className="btn" type="submit" disabled={wPending} style={{ marginTop: 16 }}>
            {wPending ? "Mengganti…" : "Ganti Password"}
          </button>
        </form>
      </div>
    </>
  );
}
