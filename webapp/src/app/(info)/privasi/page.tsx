import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kebijakan Privasi | Bank Sampah Digital" };

export default function PrivasiPage() {
  return (
    <article>
      <h1>Kebijakan Privasi</h1>
      <p className="muted">Diperbarui 20 Juli 2026</p>

      <p>
        Halaman ini menjelaskan data yang kami kumpulkan dan cara kami menggunakannya. Dengan
        memakai aplikasi ini, Anda menyetujui praktik yang diuraikan di bawah.
      </p>

      <h2>Data yang kami kumpulkan</h2>
      <ul>
        <li>Data akun: nama, nomor HP, alamat/RT-RW, dan email.</li>
        <li>Data keamanan: kata sandi disimpan dalam bentuk hash (Argon2), bukan teks asli.</li>
        <li>Data transaksi: riwayat setoran (jenis, berat, poin) dan penukaran (poin, jumlah rupiah).</li>
      </ul>

      <h2>Penggunaan data</h2>
      <ul>
        <li>Mengelola saldo poin dan memproses penukaran.</li>
        <li>Memverifikasi email dan mengamankan akun (login, reset kata sandi).</li>
        <li>Menyusun laporan kegiatan bank sampah untuk pengurus.</li>
      </ul>

      <h2>Penyimpanan &amp; pihak ketiga</h2>
      <p>
        Data disimpan pada basis data terkelola. Kami menggunakan layanan pihak ketiga hanya untuk
        pengiriman email verifikasi/reset kata sandi. Kami tidak menjual data pribadi Anda.
      </p>

      <h2>Hak Anda</h2>
      <p>
        Anda dapat memperbarui data diri melalui halaman Profil, atau meminta koreksi/penghapusan
        data dengan menghubungi pengurus bank sampah setempat.
      </p>
    </article>
  );
}
