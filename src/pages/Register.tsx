import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pesanErrorAuth } from "../lib/auth-errors";
import { register } from "../lib/repo";

export default function Register() {
  const navigate = useNavigate();
  const [f, setF] = useState({ nama: "", noHp: "", alamat: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [sibuk, setSibuk] = useState(false);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSibuk(true);
    try {
      await register(f.nama.trim(), f.noHp.trim(), f.alamat.trim(), f.email.trim(), f.password);
      navigate("/warga", { replace: true });
    } catch (err) {
      setError(pesanErrorAuth(err));
      setSibuk(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 32 }}>
      <h1>Daftar Warga</h1>
      <p className="muted">Buat akun untuk memantau poin sampahmu.</p>
      <form onSubmit={submit}>
        <label htmlFor="nama">Nama lengkap</label>
        <input id="nama" className="input" required maxLength={100} value={f.nama} onChange={set("nama")} />
        <label htmlFor="noHp">No. HP</label>
        <input id="noHp" className="input" type="tel" required value={f.noHp} onChange={set("noHp")} />
        <label htmlFor="alamat">Alamat / RT-RW</label>
        <input id="alamat" className="input" required value={f.alamat} onChange={set("alamat")} />
        <label htmlFor="email">Email</label>
        <input id="email" className="input" type="email" autoComplete="email" required value={f.email} onChange={set("email")} />
        <label htmlFor="password">Password</label>
        <input id="password" className="input" type="password" autoComplete="new-password" required minLength={6} value={f.password} onChange={set("password")} />
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit" disabled={sibuk} style={{ marginTop: 16 }}>
          {sibuk ? "Mendaftarkan…" : "Daftar"}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Sudah punya akun? <Link to="/login">Masuk</Link>
      </p>
    </div>
  );
}
