"use client";
import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { loginAction, requestResetAction } from "@/lib/actions/auth";

type LoginState = { error?: string };
type ResetState = { error?: string; info?: string };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    (_prev, fd) => loginAction(fd),
    {},
  );
  const [email, setEmail] = useState("");
  const [resetMsg, setResetMsg] = useState<ResetState>({});
  const [resetPending, startResetTransition] = useTransition();

  const lupaPassword = () => {
    setResetMsg({});
    if (!email.trim()) {
      setResetMsg({ error: "Isi email di atas dulu, lalu tekan “Lupa password?” lagi." });
      return;
    }
    const fd = new FormData();
    fd.set("email", email.trim());
    startResetTransition(async () => {
      setResetMsg(await requestResetAction(fd));
    });
  };

  return (
    <>
      <h1>Selamat datang kembali</h1>
      <p className="auth-sub">Masuk untuk mengelola tabungan sampahmu.</p>
      <form action={formAction}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          className="input"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="label-baris">
          <label htmlFor="password">Password</label>
          <button type="button" className="tautan-kecil" onClick={lupaPassword} disabled={resetPending}>
            Lupa password?
          </button>
        </div>
        <input id="password" name="password" className="input" type="password" autoComplete="current-password" required />
        <p aria-live="polite" style={{ margin: state?.error || resetMsg.error || resetMsg.info ? "8px 0 0" : 0 }}>
          {state?.error && <span className="error">{state.error}</span>}
          {resetMsg.error && <span className="error">{resetMsg.error}</span>}
          {resetMsg.info && <span className="sukses">{resetMsg.info}</span>}
        </p>
        <button className="btn" type="submit" disabled={pending} style={{ marginTop: 20 }}>
          {pending ? "Memproses…" : "Masuk"}
        </button>
      </form>
      <p className="auth-kaki">
        Belum punya akun? <Link href="/register">Daftar sekarang</Link>
      </p>
    </>
  );
}
