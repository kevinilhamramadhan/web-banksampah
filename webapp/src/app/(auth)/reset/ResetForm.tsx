"use client";
import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/auth";

type ResetState = { error?: string; info?: string };

export default function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    (_prev, fd) => resetPasswordAction(fd),
    {},
  );

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: 480, paddingTop: 32 }}>
        <h1>Reset Password</h1>
        <p className="error">Tautan reset tidak valid. Minta tautan baru lewat halaman login.</p>
        <Link href="/login">Kembali ke login</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 32 }}>
      <h1>Reset Password</h1>
      <p className="muted">Masukkan password baru Anda.</p>
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <label htmlFor="password">Password baru</label>
        <input id="password" name="password" className="input" type="password" autoComplete="new-password" required minLength={6} />
        {state?.error && <p className="error">{state.error}</p>}
        {state?.info && <p className="sukses">{state.info}</p>}
        <button className="btn" type="submit" disabled={pending} style={{ marginTop: 16 }}>
          {pending ? "Memproses…" : "Ubah Password"}
        </button>
      </form>
      {state?.info && (
        <p style={{ marginTop: 16 }}>
          <Link href="/login">Ke halaman login</Link>
        </p>
      )}
    </div>
  );
}
