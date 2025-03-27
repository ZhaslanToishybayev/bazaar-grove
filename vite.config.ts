
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    process.env.NODE_ENV === 'development' ? componentTagger() : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env.LOVABLE_BADGE': JSON.stringify('false'),
    '__LOVABLE_DISABLE_BADGE': 'true',
    'window.LOVABLE_BADGE': 'false',
    'window.__LOVABLE_DISABLE_BADGE': 'true',
    'window.HIDE_LOVABLE_EDIT_BANNER': 'true',
  },
});
