"use client";
import { useState, useTransition } from "react";
import {
  muatJenisAction,
  tambahJenisAction,
  ubahTarifAction,
  toggleJenisAction,
  type JenisDTO,
} from "@/lib/actions/jenis";

export default function KelolaJenis({ awal }: { awal: JenisDTO[] }) {
  const [list, setList] = useState<JenisDTO[]>(awal);
  const [nama, setNama] = useState("");
  const [tarif, setTarif] = useState("");
  const [pesan, setPesan] = useState<{ error?: string; sukses?: string }>({});
  const [pending, mulai] = useTransition();

  const segarkan = async () => {
    const r = await muatJenisAction();
    if (!("error" in r)) setList(r);
  };

  const tambah = () => {
    setPesan({});
    mulai(async () => {
      const r = await tambahJenisAction(nama, Number(tarif));
      if ("error" in r) return setPesan({ error: r.error });
      setPesan({ sukses: `Jenis "${nama.trim()}" ditambahkan.` });
      setNama("");
      setTarif("");
      await segarkan();
    });
  };

  const tarifValid = /^\d+$/.test(tarif) && Number(tarif) > 0 && nama.trim() !== "";

  return (
    <div>
      <div className="card">
        <h2 style={{ fontSize: "1.02rem" }}>Tambah jenis sampah</h2>
        <label htmlFor="nama-jenis">Nama jenis</label>
        <input
          id="nama-jenis"
          className="input"
          placeholder="mis. Kertas"
          value={nama}
          maxLength={40}
          onChange={(e) => setNama(e.target.value)}
        />
        <label htmlFor="tarif-jenis">Tarif (poin per kg)</label>
        <input
          id="tarif-jenis"
          className="input"
          inputMode="numeric"
          placeholder="mis. 5"
          value={tarif}
          onChange={(e) => setTarif(e.target.value.replace(/[^\d]/g, ""))}
        />
        <button className="btn" type="button" disabled={!tarifValid || pending} onClick={tambah} style={{ marginTop: 16 }}>
          {pending ? "Menyimpan…" : "Tambah"}
        </button>
      </div>

      <p aria-live="polite" style={{ margin: pesan.error || pesan.sukses ? "8px 0" : 0 }}>
        {pesan.error && <span className="error">{pesan.error}</span>}
        {pesan.sukses && <span className="sukses">{pesan.sukses}</span>}
      </p>

      <h2 style={{ fontSize: "1.02rem", marginTop: 8 }}>Daftar jenis ({list.length})</h2>
      {list.length === 0 ? (
        <p className="muted">Belum ada jenis sampah.</p>
      ) : (
        list.map((j) => (
          <BarisJenis
            key={j.id}
            j={j}
            pending={pending}
            onSimpanTarif={(nilai) => {
              setPesan({});
              mulai(async () => {
                const r = await ubahTarifAction(j.id, nilai);
                if ("error" in r) return setPesan({ error: r.error });
                setPesan({ sukses: `Tarif "${j.nama}" diperbarui.` });
                await segarkan();
              });
            }}
            onToggle={() => {
              setPesan({});
              mulai(async () => {
                const r = await toggleJenisAction(j.id);
                if ("error" in r) return setPesan({ error: r.error });
                await segarkan();
              });
            }}
          />
        ))
      )}
    </div>
  );
}

function BarisJenis({
  j,
  pending,
  onSimpanTarif,
  onToggle,
}: {
  j: JenisDTO;
  pending: boolean;
  onSimpanTarif: (nilai: number) => void;
  onToggle: () => void;
}) {
  const [tarif, setTarif] = useState(String(j.tarifPoinPerKg));
  const berubah = tarif !== String(j.tarifPoinPerKg) && /^\d+$/.test(tarif) && Number(tarif) > 0;
  // Status disandikan lewat badge, bukan opacity — menurunkan opacity teks bisa
  // menjatuhkan kontras di bawah AA.
  return (
    <div className="card">
      <div className="baris" style={{ marginBottom: 10 }}>
        <strong>{j.nama}</strong>
        {/* Badge status, bukan chip: sengaja tak berbentuk tombol supaya tak terlihat bisa ditekan. */}
        <span className={`status${j.aktif ? "" : " mati"}`}>{j.aktif ? "Aktif" : "Nonaktif"}</span>
      </div>
      {/* Baris tarif: kelompok input di kiri, aksi utama di kanan. Tanpa wrap agar
          tidak pernah terlihat seperti tata letak yang jebol. */}
      <div className="baris" style={{ gap: 8 }}>
        <span className="baris" style={{ gap: 8 }}>
          <input
            className="input"
            inputMode="numeric"
            aria-label={`Tarif ${j.nama} (poin per kg)`}
            value={tarif}
            onChange={(e) => setTarif(e.target.value.replace(/[^\d]/g, ""))}
            style={{ maxWidth: 84 }}
          />
          <span className="muted">poin/kg</span>
        </span>
        {/* Simpan = aksi utama baris ini; mengubah status sengaja dibuat tenang. */}
        <button className="btn kecil" type="button" disabled={!berubah || pending} onClick={() => onSimpanTarif(Number(tarif))}>
          Simpan
        </button>
      </div>
      <div style={{ marginTop: 10 }}>
        <button className="btn kecil sekunder" type="button" disabled={pending} onClick={onToggle}>
          {j.aktif ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </div>
  );
}
