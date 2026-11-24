import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deploy under a subpath (GitHub Pages: GH_PAGES_BASE=bento-app) or at root
// (local/dev). Read WITHOUT a leading slash so no shell mangles it.
const rawBase = process.env.GH_PAGES_BASE || '';
const base = rawBase ? `/${rawBase.replace(/^\/+|\/+$/g, '')}/` : '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
});
