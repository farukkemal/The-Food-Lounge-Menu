import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { menuApiPlugin } from './server/menuApiPlugin.mjs';

export default defineConfig({
  plugins: [react(), tailwindcss(), menuApiPlugin()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    cssMinify: true,
  },
});
