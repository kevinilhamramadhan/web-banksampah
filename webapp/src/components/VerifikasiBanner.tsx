"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resendVerificationAction } from "@/lib/actions/auth";

/** Banner "verifikasi email dulu" + kirim ulang (cooldown 60 dtk) + cek status. */
export default function VerifikasiBanner({ email }: { email: string }) {
  const router = useRouter();
  const [cooldown, setCooldown] = useState(0);
  const [pesan, setPesan] = useState<{ error?: string; info?: string }>({});
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const kirimUlang = () => {
    setPesan({});
    startTransition(async () => {
      const res = await resendVerificationAction();
      setPesan(res);
      if (!res.error) setCooldown(60);
    });
  };

  const cek = () => {
    setPesan({});
    router.refresh();
  };

  return (
    <div className="card" style={{ borderColor: "var(--emas)" }}>
      <h3>Verifikasi email dulu</h3>
      <p className="muted">Scan QR penukaran poin hanya bisa setelah email {email} terverifikasi.</p>
      {pesan.error && <p className="error">{pesan.error}</p>}
      {pesan.info && <p className="sukses">{pesan.info}</p>}
      <div className="baris">
        <button className="btn kecil sekunder" onClick={kirimUlang} disabled={cooldown > 0 || pending}>
          {cooldown > 0 ? `Kirim ulang (${cooldown})` : "Kirim ulang email"}
        </button>
        <button className="btn kecil" onClick={cek}>
          Sudah verifikasi
        </button>
      </div>
    </div>
  );
}
