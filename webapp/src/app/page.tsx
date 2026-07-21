import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session-next";
import InstallButtonKecil from "@/components/InstallButtonKecil";

// Beranda publik: kenalkan edukasi sampah dulu, tidak langsung menyuruh login.
// Pengguna yang sudah masuk diarahkan ke dashboard-nya.
export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ops" ? "/ops" : "/warga");

  return (
    <div className="landing">
      <header className="hero blob-container" style={{ padding: "40px 0 20px" }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-merek glass" style={{ display: "inline-flex", padding: "10px 20px", borderRadius: "999px", marginBottom: "20px", alignItems: "center", gap: "10px" }}>
            <Image src="/icon-192.png" alt="" width={32} height={32} style={{ borderRadius: 8 }} />
            <span style={{ fontWeight: 700 }}>Bank Sampah Digital</span>
          </div>
          <h1 className="gradient-text animate-float" style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "20px" }}>Pilah sampahmu,<br/>rawat lingkungan,<br/>tabung jadi uang.</h1>
          <p>
            Kenali jenis sampah dan cara mengolahnya — lalu setor sampah anorganikmu ke bank sampah
            untuk jadi tabungan poin yang bisa dicairkan.
          </p>
          <div className="hero-aksi">
            <Link className="btn di-hijau" href="/register">Daftar Gratis</Link>
            <Link className="btn sekunder di-hijau" href="/login">Masuk</Link>
          </div>
          <InstallButtonKecil />
        </div>
      </header>

      <main className="container landing-isi" style={{ marginTop: "20px", position: "relative", zIndex: 1 }}>
        <section aria-labelledby="jenis">
          <h2 id="jenis" style={{ fontWeight: 800 }}>Kenali jenis sampahmu</h2>
          <p className="muted">
            Memilah dari rumah adalah langkah pertama. Secara umum sampah dibagi dua: organik dan anorganik.
          </p>
          <div className="dua-kolom">
            <div className="card">
              <h3><span aria-hidden="true">🌱 </span>Sampah Organik</h3>
              <p className="muted" style={{ marginTop: 0 }}>Berasal dari makhluk hidup dan mudah terurai secara alami.</p>
              <div className="contoh">
                {["Sisa makanan", "Kulit buah & sayur", "Daun kering", "Ampas kopi/teh", "Cangkang telur"].map((x) => (
                  <span className="chip" key={x}>{x}</span>
                ))}
              </div>
              <p style={{ marginBottom: 0 }}>
                Bisa diolah sendiri jadi <strong>kompos</strong> atau <strong>eco-enzyme</strong>.
              </p>
            </div>
            <div className="card">
              <h3><span aria-hidden="true">♻️ </span>Sampah Anorganik</h3>
              <p className="muted" style={{ marginTop: 0 }}>Sulit terurai, tapi bernilai ekonomi bila dipilah &amp; didaur ulang.</p>
              <div className="contoh">
                {["Plastik", "Kertas & kardus", "Logam & kaleng", "Kaca", "Botol"].map((x) => (
                  <span className="chip" key={x}>{x}</span>
                ))}
              </div>
              <p style={{ marginBottom: 0 }}>
                Setor ke <strong>bank sampah</strong> → jadi poin → cair jadi uang.
              </p>
            </div>
          </div>
          <div className="kartu-perhatian">
            <svg className="ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <strong>Sampah berbahaya (B3) dipisah sendiri.</strong>
              <p className="muted" style={{ margin: "4px 0 0" }}>
                Baterai, lampu, elektronik, dan obat kedaluwarsa jangan dicampur — serahkan ke fasilitas pengumpulan khusus.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="organik">
          <h2 id="organik" style={{ fontWeight: 800, marginTop: "40px" }}>Olah sampah organik di rumah</h2>
          <div className="dua-kolom">
            <div className="card">
              <h3>Kompos (pupuk)</h3>
              <ol className="langkah">
                <li>Pisahkan sampah organik, potong/cacah kecil agar cepat terurai.</li>
                <li>Susun berlapis: bahan &ldquo;coklat&rdquo; (daun kering) dan &ldquo;hijau&rdquo; (sisa sayur/buah).</li>
                <li>Jaga kelembapan (lembap, tak becek) dan aduk tiap beberapa hari agar ada udara.</li>
                <li>Setelah 3–6 minggu, kompos matang: berwarna gelap, gembur, dan berbau seperti tanah.</li>
                <li>Gunakan sebagai pupuk tanaman.</li>
              </ol>
            </div>
            <div className="card">
              <h3>Eco-enzyme (cairan serbaguna)</h3>
              <ol className="langkah">
                <li>Siapkan perbandingan <strong>1 : 3 : 10</strong> — gula merah : sisa kulit buah/sayur : air.</li>
                <li>Campur dalam wadah plastik bertutup, sisakan ruang udara. Tutup rapat.</li>
                <li>Bulan pertama, buka sebentar tiap hari untuk membuang gas fermentasi.</li>
                <li>Fermentasi ±3 bulan di tempat teduh, lalu saring cairannya.</li>
                <li>Manfaatkan sebagai pembersih alami, pupuk cair, atau pengusir bau.</li>
              </ol>
            </div>
          </div>
        </section>

        <section aria-labelledby="anorganik">
          <h2 id="anorganik" style={{ fontWeight: 800, marginTop: "40px" }}>Olah sampah anorganik lewat bank sampah</h2>
          <p className="muted">
            Sampah anorganik yang bersih dan terpilah punya nilai jual. Alih-alih dibuang, tabung lewat bank sampah:
          </p>
          <ol className="langkah">
            <li><strong>Pilah &amp; bersihkan</strong> — pisahkan plastik, kertas, logam; pastikan kering.</li>
            <li><strong>Bawa ke petugas</strong> bank sampah pada jadwal setoran.</li>
            <li><strong>Ditimbang</strong> — berat dikonversi jadi poin sesuai tarif tiap jenis.</li>
            <li><strong>Poin masuk saldo</strong> otomatis dan tercatat di aplikasi.</li>
            <li><strong>Tukar jadi uang</strong> — petugas membuat QR, kamu pindai untuk mencairkan.</li>
          </ol>
          <div className="hero-aksi" style={{ margin: "16px auto 0" }}>
            <Link className="btn" href="/register">Mulai menabung sampah</Link>
          </div>
        </section>

        <footer className="landing-footer">
          <p style={{ margin: 0 }}>
            <Link href="/tentang">Tentang</Link> · <Link href="/privasi">Privasi</Link> ·{" "}
            <Link href="/ketentuan">Ketentuan</Link>
          </p>
          <p className="muted" style={{ marginTop: 8 }}>
            Sudah punya akun? <Link href="/login">Masuk</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
