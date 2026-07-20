// Serializer CSV murni (tanpa library). RFC 4180: escape kutip/koma/newline,
// pemisah CRLF, plus BOM UTF-8 agar Excel membaca karakter Indonesia dengan benar.
export type SelCsv = string | number;

const BOM = String.fromCharCode(0xfeff);

export function bidangCsv(v: SelCsv): string {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function keCsv(header: string[], baris: SelCsv[][]): string {
  const lines = [header, ...baris].map((r) => r.map(bidangCsv).join(","));
  return BOM + lines.join("\r\n") + "\r\n";
}
