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
      <>
        <h1>Reset Password</h1>
        <p className="auth-sub error">Tautan reset tidak valid. Minta tautan baru lewat halaman masuk.</p>
        <Link href="/login" className="btn">
          Ke Halaman Masuk
        </Link>
      </>
    );
  }

  return (
    <>
      <h1>Buat password baru</h1>
      <p className="auth-sub">Password lama akan dinonaktifkan dan semua perangkat dikeluarkan.</p>
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <label htmlFor="password">Password baru</label>
        <input
          id="password"
          name="password"
          className="input"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          aria-describedby="ket-password"
        />
        <p id="ket-password" className="muted" style={{ margin: "6px 0 0", fontSize: "0.82rem" }}>
          Minimal 6 karakter.
        </p>
        <p aria-live="polite" style={{ margin: state?.error || state?.info ? "8px 0 0" : 0 }}>
          {state?.error && <span className="error">{state.error}</span>}
          {state?.info && <span className="sukses">{state.info}</span>}
        </p>
        <button className="btn" type="submit" disabled={pending} style={{ marginTop: 20 }}>
          {pending ? "Memproses…" : "Ubah Password"}
        </button>
      </form>
      {state?.info && (
        <p className="auth-kaki">
          <Link href="/login">Ke halaman masuk</Link>
        </p>
      )}
    </>
  );
}
