import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { PAGE_SIZE, type Page } from "../lib/repo";

interface Props<T> {
  /** Ambil satu halaman; dipanggil ulang dengan kursor untuk "Muat lebih banyak". */
  fetchPage: (after: QueryDocumentSnapshot | null) => Promise<Page<T>>;
  renderItem: (item: T) => ReactNode;
  kosong: string;
}

export default function RiwayatList<T extends { id: string }>({ fetchPage, renderItem, kosong }: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [last, setLast] = useState<QueryDocumentSnapshot | null>(null);
  const [habis, setHabis] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState("");

  const muat = useCallback(
    async (after: QueryDocumentSnapshot | null) => {
      setSibuk(true);
      setError("");
      try {
        const page = await fetchPage(after);
        setItems((prev) => (after ? [...prev, ...page.items] : page.items));
        setLast(page.last);
        setHabis(page.items.length < PAGE_SIZE);
      } catch {
        setError("Gagal memuat riwayat. Coba lagi.");
      } finally {
        setSibuk(false);
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    setItems([]);
    setLast(null);
    setHabis(false);
    void muat(null);
  }, [muat]);

  if (error) return <p className="error">{error}</p>;
  if (!sibuk && items.length === 0) return <p className="muted">{kosong}</p>;

  return (
    <div>
      {items.map((it) => (
        <div className="riwayat-item" key={it.id}>
          {renderItem(it)}
        </div>
      ))}
      {sibuk && <p className="muted">Memuat…</p>}
      {!sibuk && !habis && (
        <button className="btn kecil sekunder" style={{ margin: "12px auto" }} onClick={() => void muat(last)}>
          Muat lebih banyak
        </button>
      )}
    </div>
  );
}
