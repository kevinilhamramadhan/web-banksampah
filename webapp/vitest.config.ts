import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    projects: [
      { test: { name: "unit", include: ["src/**/*.test.ts"] } },
      {
        resolve: { alias: { "@": path.resolve(__dirname, "src") } },
        test: { name: "db", include: ["tests/db/**/*.test.ts"], fileParallelism: false, testTimeout: 20000 },
      },
    ],
  },
});
