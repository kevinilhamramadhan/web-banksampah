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
      setResetMsg({ error: "Isi email dulu, lalu tekan “Lupa password” lagi." });
      return;
    }
    const fd = new FormData();
    fd.set("email", email.trim());
    startResetTransition(async () => {
      setResetMsg(await requestResetAction(fd));
    });
  };

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 32 }}>
      <h1>Masuk</h1>
      <p className="muted">Bank Sampah KKN</p>
      <form action={formAction}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          className="input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" className="input" type="password" autoComplete="current-password" required />
        {state?.error && <p className="error">{state.error}</p>}
        {resetMsg.error && <p className="error">{resetMsg.error}</p>}
        {resetMsg.info && <p className="sukses">{resetMsg.info}</p>}
        <button className="btn" type="submit" disabled={pending} style={{ marginTop: 16 }}>
          {pending ? "Memproses…" : "Masuk"}
        </button>
      </form>
      <div className="baris" style={{ marginTop: 16 }}>
        <button className="btn kecil sekunder" type="button" onClick={lupaPassword} disabled={resetPending}>
          Lupa password?
        </button>
        <Link href="/register">Daftar akun warga</Link>
      </div>
    </div>
  );
}
