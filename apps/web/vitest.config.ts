import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["test/**/*.test.ts"],
    environment: "jsdom",
    setupFiles: ["dotenv/config", "test/test-setup.ts"],
    coverage: {
      include: ["app/**"],
      provider: "istanbul",
    },
  },
});
