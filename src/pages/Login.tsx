import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pesanErrorAuth } from "../lib/auth-errors";
import { login, resetPassword } from "../lib/repo";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [sibuk, setSibuk] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSibuk(true);
    try {
      const role = await login(email.trim(), password);
      navigate(role === "ops" ? "/ops" : "/warga", { replace: true });
    } catch (err) {
      setError(pesanErrorAuth(err));
    } finally {
      setSibuk(false);
    }
  };

  const lupaPassword = async () => {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Isi email dulu, lalu tekan “Lupa password” lagi.");
      return;
    }
    try {
      await resetPassword(email.trim());
      setInfo("Email reset password sudah dikirim. Cek kotak masuk Anda.");
    } catch (err) {
      setError(pesanErrorAuth(err));
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 32 }}>
      <h1>Masuk</h1>
      <p className="muted">Bank Sampah KKN</p>
      <form onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error">{error}</p>}
        {info && <p className="sukses">{info}</p>}
        <button className="btn" type="submit" disabled={sibuk} style={{ marginTop: 16 }}>
          {sibuk ? "Memproses…" : "Masuk"}
        </button>
      </form>
      <div className="baris" style={{ marginTop: 16 }}>
        <button className="btn kecil sekunder" type="button" onClick={lupaPassword}>
          Lupa password?
        </button>
        <Link to="/register">Daftar akun warga</Link>
      </div>
    </div>
  );
}
