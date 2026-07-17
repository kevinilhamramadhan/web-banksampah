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
      <div className="container" style={{ maxWidth: 480, paddingTop: 32 }}>
        <h1>Verifikasi Email</h1>
        <p className="error">Tautan verifikasi tidak valid atau sudah kedaluwarsa.</p>
        <div style={{ marginTop: 16 }}>
          <Link href="/login" className="btn">
            Masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 32 }}>
      <h1>Verifikasi Email</h1>
      {!state?.ok && !state?.error && (
        <>
          <p className="muted">Tekan tombol di bawah untuk memverifikasi email Anda.</p>
          <form action={() => formAction(token)}>
            <button className="btn" type="submit" disabled={pending} style={{ marginTop: 16 }}>
              {pending ? "Memproses…" : "Verifikasi Email Saya"}
            </button>
          </form>
        </>
      )}
      {state?.ok && <p className="sukses">Email berhasil diverifikasi.</p>}
      {state?.error && <p className="error">{state.error}</p>}
      {(state?.ok || state?.error) && (
        <div style={{ marginTop: 16 }}>
          <Link href="/login" className="btn">
            Masuk
          </Link>
        </div>
      )}
    </div>
  );
}
