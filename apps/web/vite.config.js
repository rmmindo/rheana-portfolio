import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Substitutes %VITE_*% placeholders in index.html. Vite only does this for
// its own special tokens, and the analytics snippet needs the site code inlined
// before the file is served.
const htmlEnv = () => ({
  name: 'html-env',
  transformIndexHtml: {
    order: 'pre',
    handler: html => html.replace(/%(VITE_[A-Z0-9_]+)%/g, (_, key) => process.env[key] ?? ''),
  },
});

export default defineConfig({
  plugins: [react(), htmlEnv()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    reportCompressedSize: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ["./test/setup.js"],
    exclude: ['**/node_modules/**', '**/dist/**', '**/deprecated/**'],
  },
});
