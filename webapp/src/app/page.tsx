import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session-next";
import InstallButtonKecil from "@/components/InstallButtonKecil";

// Beranda publik: kenalkan edukasi sampah dulu, tidak langsung menyuruh login.
// Pengguna yang sudah masuk diarahkan ke dashboard-nya.
export default async function Home() {
  const user = await getSessionUser();
  if (user) {
    redirect(
      user.role === "ops"
        ? "/ops"
        : user.emailVerifiedAt
        ? "/warga"
        : "/warga/tunggu-verifikasi"
    );
  }

  return (
    <div className="landing">
      <header className="hero" style={{ padding: "40px 0 20px" }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-merek" style={{ display: "inline-flex", padding: "10px 20px", borderRadius: "999px", marginBottom: "20px", alignItems: "center", gap: "10px" }}>
            <Image src="/icon-192.png" alt="" width={32} height={32} style={{ borderRadius: 8 }} />
            <span style={{ fontWeight: 700 }}>Bank Sampah Digital</span>
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "20px", textWrap: "balance" }}>Pilah sampahmu,<br />rawat lingkungan,<br />tabung jadi uang.</h1>
          <p>
            Kenali jenis sampah dan cara mengolahnya, lalu setor sampah anorganikmu ke bank sampah
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
            Memilah dari rumah adalah langkah pertama. Sampah rumah tangga dibagi dua yaitu organik dan anorganik.
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
                Setor ke <strong>bank sampah</strong>, kumpulkan poin, lalu cairkan jadi uang.
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
                <li>Kumpulin daun kering sama sisa dapur di titik pengumpulan RT masing-masing.</li>
                <li>Cacah dulu sampahnya biar gak terlalu besar dan cepat terurai.</li>
                <li>Campur dengan bioaktivator <strong>EM4</strong> secukupnya biar penguraian lancar.</li>
                <li>Jaga tumpukan tetap lembap dan balik secara berkala tiap 3–5 hari sekali.</li>
                <li>Kira-kira 3–4 minggu kompos sudah matang dan siap dipakai buat pupuk tanaman pekarangan, TOGA, atau lahan pertanian.</li>
              </ol>
            </div>
            <div className="card">
              <h3>Eco-enzyme (cairan serbaguna)</h3>
              <ol className="langkah">
                <li>Pilah kulit buah dan sisa sayuran dari sampah dapur rumah tangga.</li>
                <li>Pakai takaran <strong>3 bagian limbah organik berbanding 1 bagian gula merah atau tetes tebu berbanding 10 bagian air</strong>.</li>
                <li>Campur semua dalam wadah tertutup, tapi sisakan ruang udara di bagian atasnya.</li>
                <li>Pada bulan pertama, buka wadah sebentar untuk membuang gas hasil fermentasi.</li>
                <li>Tunggu proses fermentasi sampai <strong>±3 bulan</strong>.</li>
                <li>Setelah selesai, cairannya bisa dipakai buat pembersih serbaguna sekaligus pupuk organik cair pendamping.</li>
              </ol>
            </div>
          </div>
        </section>

        <section aria-labelledby="anorganik">
          <h2 id="anorganik" style={{ fontWeight: 800, marginTop: "40px" }}>Olah sampah anorganik lewat bank sampah</h2>
          <p className="muted">
            Sampah anorganik yang bersih dan terpilah punya nilai jual. Alih-alih dibuang, tabung saja lewat bank sampah.
          </p>
          <ol className="langkah">
            <li><strong>Pilah &amp; bersihkan</strong>, pisahkan plastik, kertas, dan logam serta pastikan kering.</li>
            <li><strong>Bawa ke petugas</strong> bank sampah pada jadwal setoran.</li>
            <li><strong>Ditimbang</strong>, berat dikonversi jadi poin sesuai tarif tiap jenis.</li>
            <li><strong>Poin masuk saldo</strong> otomatis dan tercatat di aplikasi.</li>
            <li><strong>Tukar jadi uang</strong>, petugas membuat QR lalu kamu pindai untuk mencairkan.</li>
          </ol>
        </section>

        <section>
          <div className="hero-aksi" style={{ margin: "48px auto 36px" }}>
            <Link className="btn" href="/register">Mulai menabung sampah</Link>
          </div>
        </section>

        <footer className="landing-footer">
          <p style={{ margin: 0 }}>
            <Link href="/tentang">Tentang</Link>
            <span aria-hidden="true"> | </span>
            <Link href="/privasi">Privasi</Link>
            <span aria-hidden="true"> | </span>
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
