"use client";
import { useEffect, useState } from "react";

type Tema = "light" | "dark" | "system";
const OPSI: { nilai: Tema; label: string }[] = [
  { nilai: "light", label: "Terang" },
  { nilai: "dark", label: "Gelap" },
  { nilai: "system", label: "Ikuti Sistem" },
];

// Pemilih tema: menulis localStorage 'tema' + data-theme di <html> (dibaca skrip no-flash
// di layout saat muat berikutnya). 'system' menghapus keduanya → media query yang mengatur.
export default function TombolTema() {
  const [tema, setTema] = useState<Tema>("system");

  useEffect(() => {
    const t = localStorage.getItem("tema");
    setTema(t === "dark" || t === "light" ? t : "system");
  }, []);

  const pilih = (t: Tema) => {
    setTema(t);
    if (t === "system") {
      localStorage.removeItem("tema");
      delete document.documentElement.dataset.theme;
    } else {
      localStorage.setItem("tema", t);
      document.documentElement.dataset.theme = t;
    }
  };

  return (
    <div className="tab-bar" role="group" aria-label="Pilih tema tampilan">
      {OPSI.map((o) => (
        <button
          key={o.nilai}
          type="button"
          className={`chip ${tema === o.nilai ? "aktif" : ""}`}
          aria-pressed={tema === o.nilai}
          onClick={() => pilih(o.nilai)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
