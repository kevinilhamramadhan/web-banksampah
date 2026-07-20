import type { Metadata, Viewport } from "next";
import "./globals.css";
import DaftarSW from "@/components/DaftarSW";

export const metadata: Metadata = {
  title: "Bank Sampah Digital",
  description: "Pantau poin sampah dan tukar poin jadi uang",
  applicationName: "Bank Sampah Digital",
  appleWebApp: {
    capable: true,
    title: "Bank Sampah",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2B6B3F" },
    { media: "(prefers-color-scheme: dark)", color: "#12241A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
        <DaftarSW />
      </body>
    </html>
  );
}
