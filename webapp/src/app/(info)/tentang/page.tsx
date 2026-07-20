import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tentang — Bank Sampah Digital" };

export default function TentangPage() {
  return (
    <article>
      <h1>Tentang Bank Sampah Digital</h1>
      <p className="muted">Diperbarui 20 Juli 2026</p>

      <p>
        Bank Sampah Digital adalah aplikasi untuk mencatat tabungan sampah warga. Warga menyetor
        sampah yang sudah dipilah ke petugas, sampah ditimbang, lalu beratnya dikonversi menjadi
        poin. Poin bisa dicairkan menjadi uang tunai lewat petugas bank sampah.
      </p>

      <h2>Cara kerja singkat</h2>
      <ul>
        <li>Warga mendaftar dan memverifikasi email.</li>
        <li>Petugas mencatat setoran sampah warga; poin otomatis masuk ke saldo warga.</li>
        <li>Saat menukar, petugas membuat QR dan warga memindainya untuk konfirmasi pencairan.</li>
        <li>Tarif poin per kilogram ditetapkan oleh pengurus dan dapat berbeda tiap jenis sampah.</li>
      </ul>

      <h2>Peran</h2>
      <p>
        <strong>Warga</strong> menabung sampah dan menukar poin. <strong>Petugas (ops)</strong>
        mencatat setoran, memproses penukaran, mengelola jenis sampah, serta melihat laporan.
      </p>

      <h2>Kontak</h2>
      <p>
        Untuk pertanyaan seputar saldo, penukaran, atau data akun, hubungi pengurus bank sampah di
        lingkungan Anda.
      </p>
    </article>
  );
}
