import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { SESSION_COOKIE, getUserByToken } from "./session";

export async function getSessionUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? getUserByToken(token) : null;
}

export async function requireRole(role: Role, allowUnverified = false): Promise<User> {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  if (u.role !== role) redirect(u.role === "ops" ? "/ops" : "/warga");
  if (role === "warga" && !u.emailVerifiedAt && !allowUnverified) {
    redirect("/warga/tunggu-verifikasi");
  }
  return u;
}
