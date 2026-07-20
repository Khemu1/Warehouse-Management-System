import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,

    warmup: {
      clientFiles: ["./src/main.tsx", "./src/App.tsx"],
    },

    proxy: {
      "/api": {
        target: "http://localhost:3001/api",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },

      "/ingest": {
        target: "https://us.i.posthog.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ingest/, ""),
      },
    },
  },
});
