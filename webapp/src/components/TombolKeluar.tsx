"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { logoutAction } from "@/lib/actions/auth";

export default function TombolKeluar({ kelas = "btn bahaya" }: { kelas?: string }) {
  const [buka, setBuka] = useState(false);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (buka) {
      dialogRef.current?.focus();
    }
  }, [buka]);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <>
      <button className={kelas} type="button" onClick={() => setBuka(true)}>
        Keluar Akun
      </button>

      {buka && (
        <div
          className="popup-latar"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          ref={dialogRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) setBuka(false);
          }}
        >
          <div className="popup-isi">
            <h3 style={{ marginTop: 0, fontSize: "1.2rem", fontWeight: 800 }}>Konfirmasi Keluar</h3>
            <p className="muted" style={{ margin: "12px 0 24px" }}>
              Apakah Anda yakin ingin keluar dari akun ini?
            </p>
            <div className="baris" style={{ justifyContent: "flex-end", gap: 12 }}>
              <button
                className="btn sekunder"
                type="button"
                onClick={() => setBuka(false)}
                disabled={pending}
              >
                Batal
              </button>
              <button
                className="btn bahaya"
                type="button"
                onClick={handleLogout}
                disabled={pending}
                autoFocus
              >
                {pending ? "Mengeluarkan…" : "Ya, Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
