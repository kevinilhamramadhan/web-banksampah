import type { Metadata } from "next";

export const metadata: Metadata = { title: "Syarat & Ketentuan — Bank Sampah Digital" };

export default function KetentuanPage() {
  return (
    <article>
      <h1>Syarat &amp; Ketentuan</h1>
      <p className="muted">Diperbarui 20 Juli 2026</p>

      <h2>Akun</h2>
      <ul>
        <li>Satu akun untuk satu warga. Jaga kerahasiaan kata sandi Anda.</li>
        <li>Data yang didaftarkan harus benar agar penukaran dan pelaporan akurat.</li>
      </ul>

      <h2>Poin &amp; penukaran</h2>
      <ul>
        <li>Poin diperoleh dari setoran sampah yang ditimbang petugas.</li>
        <li>Poin bukan alat pembayaran yang sah dan hanya berlaku di lingkungan bank sampah ini.</li>
        <li>Nilai tukar dan tarif poin per kilogram ditetapkan oleh pengurus dan dapat berubah.</li>
        <li>Penukaran sah setelah dikonfirmasi lewat pemindaian QR oleh warga terkait.</li>
      </ul>

      <h2>Penggunaan yang dilarang</h2>
      <ul>
        <li>Memanipulasi timbangan, poin, atau QR penukaran.</li>
        <li>Menggunakan akun orang lain tanpa izin.</li>
      </ul>

      <h2>Perubahan</h2>
      <p>
        Ketentuan ini dapat diperbarui sewaktu-waktu. Perubahan berlaku sejak dimuat di halaman ini.
      </p>
    </article>
  );
}
