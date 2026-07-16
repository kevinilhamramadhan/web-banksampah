import { defineConfig } from "vitest/config";

// Test integrasi terhadap emulator Auth+Firestore dengan firestore.rules asli.
// Jalankan via: npm run test:emu
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], testTimeout: 20000, fileParallelism: false },
});
