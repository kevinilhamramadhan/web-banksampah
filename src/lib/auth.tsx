import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { myRole } from "./repo";
import type { Role } from "./models";

interface AuthState {
  user: User | null;
  role: Role | null;
  loading: boolean;
  /** Paksa baca ulang emailVerified dsb. setelah reload user. */
  refresh: () => void;
}

const AuthCtx = createContext<AuthState>({ user: null, role: null, loading: true, refresh: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, "refresh">>({ user: null, role: null, loading: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, role: null, loading: false });
        return;
      }
      const role = await myRole().catch(() => null);
      setState({ user, role, loading: false });
    });
  }, [tick]);

  return <AuthCtx.Provider value={{ ...state, refresh: () => setTick((t) => t + 1) }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

/** Route guard: wajib login dengan role tertentu; role lain diarahkan ke berandanya. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const a = useAuth();
  if (a.loading) {
    return (
      <div className="container kolom-tengah" style={{ paddingTop: "40vh" }}>
        <p className="muted">Memuat…</p>
      </div>
    );
  }
  if (!a.user || !a.role) return <Navigate to="/login" replace />;
  if (a.role !== role) return <Navigate to={a.role === "ops" ? "/ops" : "/warga"} replace />;
  return children;
}
