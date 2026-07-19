"use client";
import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";

type RegisterState = { error?: string };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    (_prev, fd) => registerAction(fd),
    {},
  );

  return (
    <>
      <h1>Buat akun warga</h1>
      <p className="auth-sub">Gratis — mulai menabung dari sampah hari ini.</p>
      <form action={formAction}>
        <label htmlFor="nama">Nama lengkap</label>
        <input id="nama" name="nama" className="input" placeholder="Sesuai nama panggilan di lingkungan" autoComplete="name" required maxLength={100} />
        <label htmlFor="noHp">No. HP</label>
        <input id="noHp" name="noHp" className="input" type="tel" placeholder="08xxxxxxxxxx" autoComplete="tel" required />
        <label htmlFor="alamat">Alamat / RT-RW</label>
        <input id="alamat" name="alamat" className="input" placeholder="mis. RT 03 RW 01" required />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" className="input" type="email" placeholder="nama@email.com" autoComplete="email" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" className="input" type="password" autoComplete="new-password" required minLength={6} aria-describedby="ket-password" />
        <p id="ket-password" className="muted" style={{ margin: "6px 0 0", fontSize: "0.82rem" }}>
          Minimal 6 karakter.
        </p>
        <p aria-live="polite" style={{ margin: state?.error ? "8px 0 0" : 0 }}>
          {state?.error && <span className="error">{state.error}</span>}
        </p>
        <button className="btn" type="submit" disabled={pending} style={{ marginTop: 20 }}>
          {pending ? "Mendaftarkan…" : "Daftar"}
        </button>
      </form>
      <p className="auth-kaki">
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </>
  );
}
