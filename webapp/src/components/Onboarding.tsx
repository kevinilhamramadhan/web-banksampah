"use client";
import { useEffect, useRef, useState } from "react";

// Onboarding singkat untuk warga baru — tampil sekali (flag di localStorage).
const KUNCI = "websampah.onboarding.v1";
const SLIDE = [
  {
    judul: "1. Setor sampah",
    teks: "Bawa sampah terpilah ke petugas. Ditimbang, lalu poin otomatis masuk ke saldomu.",
  },
  {
    judul: "2. Kumpulkan poin",
    teks: "Saldo naik tiap setoran. Pantau di Beranda dan naik peringkat penabung tiap kuartal.",
  },
  {
    judul: "3. Tukar jadi uang",
    teks: "Minta petugas membuat QR penukaran, lalu pindai lewat menu Scan untuk mencairkan poin.",
  },
];

export default function Onboarding() {
  const [tampil, setTampil] = useState(false);
  const [i, setI] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KUNCI)) setTampil(true);
    } catch {
      /* localStorage tak tersedia → lewati onboarding */
    }
  }, []);

  useEffect(() => {
    if (tampil) dialogRef.current?.focus();
  }, [tampil]);

  const tutup = () => {
    try {
      localStorage.setItem(KUNCI, "1");
    } catch {
      /* abaikan */
    }
    setTampil(false);
  };

  if (!tampil) return null;
  const s = SLIDE[i];
  const akhir = i === SLIDE.length - 1;

  return (
    <div
      className="onboarding"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ob-judul"
      tabIndex={-1}
      ref={dialogRef}
    >
      <button className="ob-lewati" type="button" onClick={tutup}>
        Lewati
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" width={84} height={84} style={{ borderRadius: 20 }} />
      <div className="ob-isi">
        <h2 id="ob-judul">{s.judul}</h2>
        <p>{s.teks}</p>
      </div>
      <div className="ob-dots" aria-hidden="true">
        {SLIDE.map((_, k) => (
          <span key={k} className={k === i ? "aktif" : ""} />
        ))}
      </div>
      <div className="ob-aksi">
        {i > 0 && (
          <button className="btn sekunder di-hijau" type="button" onClick={() => setI(i - 1)}>
            Kembali
          </button>
        )}
        {akhir ? (
          <button className="btn di-hijau" type="button" onClick={tutup}>
            Mulai Menabung
          </button>
        ) : (
          <button className="btn di-hijau" type="button" onClick={() => setI(i + 1)}>
            Lanjut
          </button>
        )}
      </div>
    </div>
  );
}
