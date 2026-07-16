/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "icon-maskable.png"],
      manifest: {
        name: "Bank Sampah KKN",
        short_name: "Bank Sampah",
        description: "Pantau poin sampah dan tukar poin jadi uang",
        lang: "id",
        display: "standalone",
        start_url: "/",
        background_color: "#F6FAF0",
        theme_color: "#2B6B3F",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      // App shell saja; data Firestore punya cache SDK sendiri
      workbox: { globPatterns: ["**/*.{js,css,html,png,svg,ico}"], navigateFallback: "/index.html" },
    }),
  ],
  test: { include: ["src/**/*.test.ts"] },
});
