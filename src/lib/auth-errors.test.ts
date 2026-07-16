import { describe, expect, it } from "vitest";
import { pesanErrorAuth } from "./auth-errors";

describe("pesanErrorAuth", () => {
  it("memetakan kode umum ke bahasa Indonesia", () => {
    expect(pesanErrorAuth({ code: "auth/email-already-in-use" })).toMatch(/sudah terdaftar/i);
    expect(pesanErrorAuth({ code: "auth/invalid-credential" })).toMatch(/email atau password salah/i);
    expect(pesanErrorAuth({ code: "auth/weak-password" })).toMatch(/minimal 6/i);
    expect(pesanErrorAuth({ code: "auth/network-request-failed" })).toMatch(/internet/i);
  });
  it("kode tak dikenal memakai pesan bawaan error", () => {
    expect(pesanErrorAuth(new Error("Akun tidak terdaftar di sistem bank sampah"))).toMatch(/tidak terdaftar/);
    expect(pesanErrorAuth({})).toMatch(/terjadi kesalahan/i);
  });
});
