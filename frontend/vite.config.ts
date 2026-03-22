import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "SkillSwap Malawi",
        short_name: "SkillSwap",
        description: "Peer-to-peer skills exchange for Malawi",
        theme_color: "#14532d",
        background_color: "#faf8f5",
        display: "standalone",
        start_url: "/",
        lang: "en",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,png,woff2}"],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
