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
    <div className="container" style={{ maxWidth: 480, paddingTop: 32 }}>
      <h1>Daftar Warga</h1>
      <p className="muted">Buat akun untuk memantau poin sampahmu.</p>
      <form action={formAction}>
        <label htmlFor="nama">Nama lengkap</label>
        <input id="nama" name="nama" className="input" required maxLength={100} />
        <label htmlFor="noHp">No. HP</label>
        <input id="noHp" name="noHp" className="input" type="tel" required />
        <label htmlFor="alamat">Alamat / RT-RW</label>
        <input id="alamat" name="alamat" className="input" required />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" className="input" type="email" autoComplete="email" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" className="input" type="password" autoComplete="new-password" required minLength={6} />
        {state?.error && <p className="error">{state.error}</p>}
        <button className="btn" type="submit" disabled={pending} style={{ marginTop: 16 }}>
          {pending ? "Mendaftarkan…" : "Daftar"}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </div>
  );
}
