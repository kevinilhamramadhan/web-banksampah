import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { pesanErrorAuth } from "../lib/auth-errors";
import { reloadUser, resendVerification } from "../lib/repo";

/** Banner "verifikasi email dulu" + kirim ulang (cooldown 60 dtk) + cek status. */
export default function VerifikasiBanner() {
  const { user, refresh } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!user || user.emailVerified) return null;

  const kirimUlang = async () => {
    setPesan("");
    try {
      await resendVerification();
      setCooldown(60);
      setPesan("Email verifikasi terkirim. Cek kotak masuk (dan folder spam).");
    } catch (err) {
      setPesan(pesanErrorAuth(err));
    }
  };

  const cek = async () => {
    setPesan("");
    const ok = await reloadUser();
    if (ok) refresh();
    else setPesan("Belum terverifikasi. Klik tautan di email dulu, lalu coba lagi.");
  };

  return (
    <div className="card" style={{ borderColor: "var(--emas)" }}>
      <h3>Verifikasi email dulu</h3>
      <p className="muted">Scan QR penukaran poin hanya bisa setelah email {user.email} terverifikasi.</p>
      {pesan && <p className="muted">{pesan}</p>}
      <div className="baris">
        <button className="btn kecil sekunder" onClick={kirimUlang} disabled={cooldown > 0}>
          {cooldown > 0 ? `Kirim ulang (${cooldown})` : "Kirim ulang email"}
        </button>
        <button className="btn kecil" onClick={cek}>
          Sudah verifikasi
        </button>
      </div>
    </div>
  );
}
