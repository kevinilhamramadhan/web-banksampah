import { describe, expect, it } from "vitest";
import { bidangCsv, keCsv } from "./csv";

const BOM = String.fromCharCode(0xfeff);

describe("bidangCsv", () => {
  it("membiarkan teks polos apa adanya", () => {
    expect(bidangCsv("Budi")).toBe("Budi");
    expect(bidangCsv(42)).toBe("42");
  });
  it("membungkus & meng-escape koma, kutip, dan newline", () => {
    expect(bidangCsv("Budi, S.")).toBe('"Budi, S."');
    expect(bidangCsv('kata "penting"')).toBe('"kata ""penting"""');
    expect(bidangCsv("baris1\nbaris2")).toBe('"baris1\nbaris2"');
  });
  it("null/undefined → string kosong", () => {
    expect(bidangCsv(undefined as unknown as string)).toBe("");
  });
});

describe("keCsv", () => {
  it("BOM di depan, header + baris, pemisah CRLF, diakhiri CRLF", () => {
    const csv = keCsv(["Nama", "Poin"], [["Budi", 10], ["Ani, S.", 20]]);
    expect(csv.startsWith(BOM)).toBe(true);
    expect(csv.slice(BOM.length)).toBe('Nama,Poin\r\nBudi,10\r\n"Ani, S.",20\r\n');
  });
});
