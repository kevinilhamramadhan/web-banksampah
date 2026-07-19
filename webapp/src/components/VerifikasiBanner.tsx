"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { gantiEmailAction, resendVerificationAction } from "@/lib/actions/auth";

/** Kartu perhatian "verifikasi email dulu": kirim ulang (cooldown 60 dtk), cek status,
    dan koreksi alamat salah ketik — supaya tidak ada warga yang terjebak. */
export default function VerifikasiBanner({ email }: { email: string }) {
  const router = useRouter();
  const [cooldown, setCooldown] = useState(0);
  const [pesan, setPesan] = useState<{ error?: string; info?: string }>({});
  const [gantiTampil, setGantiTampil] = useState(false);
  const [emailBaru, setEmailBaru] = useState("");
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

  const gantiEmail = () => {
    setPesan({});
    const fd = new FormData();
    fd.set("email", emailBaru);
    startTransition(async () => {
      const res = await gantiEmailAction(fd);
      setPesan(res);
      if (!res.error) {
        setGantiTampil(false);
        setEmailBaru("");
        setCooldown(60);
        router.refresh(); // tampilkan alamat baru dari server
      }
    });
  };

  const cek = () => {
    setPesan({});
    router.refresh();
  };

  return (
    <div className="kartu-perhatian">
      <svg className="ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="m3.5 7 8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <h2 style={{ fontSize: "1.02rem" }}>Satu langkah lagi: verifikasi email</h2>
        <p className="muted" style={{ color: "var(--teks)" }}>
          Kami sudah mengirim tautan ke <strong>{email}</strong>. Klik tautannya, lalu kembali ke sini — setelah itu
          kamu bisa scan QR penukaran poin. Tidak menemukan emailnya? <strong>Cek folder spam</strong>.
        </p>
        <p aria-live="polite" style={{ margin: pesan.error || pesan.info ? undefined : 0 }}>
          {pesan.error && <span className="error">{pesan.error}</span>}
          {pesan.info && <span className="sukses">{pesan.info}</span>}
        </p>

        {gantiTampil ? (
          <div>
            <label htmlFor="email-baru">Alamat email yang benar</label>
            <input
              id="email-baru"
              className="input"
              type="email"
              autoComplete="email"
              value={emailBaru}
              onChange={(e) => setEmailBaru(e.target.value)}
            />
            <div className="baris" style={{ flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              <button className="btn kecil" onClick={gantiEmail} disabled={pending || !emailBaru.trim()}>
                Simpan & kirim ulang
              </button>
              <button className="btn kecil sekunder" onClick={() => setGantiTampil(false)}>
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="baris" style={{ flexWrap: "wrap", gap: 8 }}>
            <button className="btn kecil" onClick={kirimUlang} disabled={cooldown > 0 || pending}>
              {cooldown > 0 ? `Kirim ulang (${cooldown})` : "Kirim ulang email"}
            </button>
            <button className="btn kecil sekunder" onClick={cek}>
              Sudah verifikasi
            </button>
            <button className="btn kecil sekunder" onClick={() => setGantiTampil(true)}>
              Salah alamat? Ganti
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
