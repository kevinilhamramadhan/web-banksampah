"use client";
import { useActionState } from "react";
import Link from "next/link";
import { verifyEmailAction } from "@/lib/actions/auth";

type VerifikasiState = { ok?: boolean; error?: string };

export default function VerifikasiForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<VerifikasiState, string>(
    verifyEmailAction,
    {},
  );

  if (!token) {
    return (
      <>
        <h1>Verifikasi Email</h1>
        <p className="auth-sub error">Tautan verifikasi tidak valid atau sudah kedaluwarsa.</p>
        <Link href="/login" className="btn">
          Ke Halaman Masuk
        </Link>
      </>
    );
  }

  return (
    <>
      <h1>Verifikasi Email</h1>
      {!state?.ok && !state?.error && (
        <>
          <p className="auth-sub">Satu klik lagi dan akunmu aktif sepenuhnya.</p>
          <form action={() => formAction(token)}>
            <button className="btn" type="submit" disabled={pending}>
              {pending ? "Memproses…" : "Verifikasi Email Saya"}
            </button>
          </form>
        </>
      )}
      <p aria-live="polite" style={{ margin: state?.ok || state?.error ? "4px 0 16px" : 0 }}>
        {state?.ok && <span className="sukses">Email berhasil diverifikasi — selamat menabung sampah!</span>}
        {state?.error && <span className="error">{state.error}</span>}
      </p>
      {(state?.ok || state?.error) && (
        <Link href="/login" className="btn">
          Ke Halaman Masuk
        </Link>
      )}
    </>
  );
}
