import type { Timestamp } from "firebase/firestore";

/** "16 Jul 2026, 18.30" — pakai locale Indonesia. */
export function fmtTanggal(ts?: Timestamp | null): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
