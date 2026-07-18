// Deteksi & pemicu install PWA. Listener beforeinstallprompt harus terpasang
// sedini mungkin, karena itu modul ini dipakai dari komponen client (mis. InstallPrompt)
// yang di-render sedini mungkin agar listener terpasang sebelum event ditembak browser.
import { useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const KEY_PILIHAN = "websampah.welcomeChoice";

let deferred: BeforeInstallPromptEvent | null = null;
const subs = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    subs.forEach((f) => f());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    subs.forEach((f) => f());
  });
}

export function useCanInstall(): boolean {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => deferred !== null,
    () => false,
  );
}

export async function promptInstall(): Promise<void> {
  if (!deferred) return;
  await deferred.prompt();
  await deferred.userChoice;
  deferred = null;
  subs.forEach((f) => f());
}

export const isStandalone = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

export const isIos = (): boolean => /iphone|ipad|ipod/i.test(navigator.userAgent);

export const getPilihan = (): string | null => localStorage.getItem(KEY_PILIHAN);
export const simpanPilihan = (v: "browser" | "install"): void => localStorage.setItem(KEY_PILIHAN, v);

/** Welcome hanya tampil kalau bukan standalone dan belum pernah memilih. */
export function shouldShowWelcome(standalone: boolean, pilihan: string | null): boolean {
  return !standalone && pilihan === null;
}
