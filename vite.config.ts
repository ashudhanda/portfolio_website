import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Listen on all interfaces so the dev server is reachable from other
    // devices on the network and from inside containers.
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // lovable-tagger annotates components for visual editing; only run it in
    // development so production bundles stay clean.
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      // Lets imports use "@/..." instead of long relative paths.
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',  // Cloudflare Pages expects the dist folder
  },
}));
