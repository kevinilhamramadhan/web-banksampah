import type { Timestamp } from "firebase/firestore";

// Skema Firestore — SUDAH ADA di project bank-sampah-kkn, jangan diubah.

export type Role = "warga" | "ops";

export interface UserDoc {
  uid: string;
  role: Role;
  nama: string;
  noHp: string;
  alamat: string;
  email: string;
  namaLower: string;
  saldoPoin: number;
  lastTxnId?: string;
  createdAt?: Timestamp;
}

export interface SetoranItem {
  jenisSampahId: string;
  jenisSampahNama: string;
  beratKg: number;
  poin: number;
}

export interface Setoran {
  id: string;
  wargaId: string;
  wargaNama: string;
  opsId: string;
  items: SetoranItem[];
  totalPoin: number;
  tanggal?: Timestamp;
}

export type PenukaranStatus = "pending" | "confirmed" | "cancelled";

export interface Penukaran {
  id: string;
  wargaId: string;
  wargaNama: string;
  opsId: string;
  poinDitukar: number;
  jumlahRupiah: number;
  status: PenukaranStatus;
  qrToken: string;
  tokenExpiredAt?: Timestamp;
  confirmedAt?: Timestamp | null;
  createdAt?: Timestamp;
}
