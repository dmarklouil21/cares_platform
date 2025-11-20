import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from 'vite-plugin-svgr'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: true
  },
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets', // Ensure assets directory
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
  // Add this base configuration
  base: './',
});
