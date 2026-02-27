import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()] as PluginOption[],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
      "@web": path.resolve(__dirname, "src"),
    },
  },
});
