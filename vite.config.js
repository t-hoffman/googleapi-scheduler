import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin", // "same-origin-allow-popups"
    },
  },
  optimizeDeps: {
    // force: true,
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
});
