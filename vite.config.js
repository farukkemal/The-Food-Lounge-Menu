import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { menuApiPlugin } from './server/menuApiPlugin.mjs';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/The-Food-Lounge-Menu/' : '/',
  plugins: [react(), tailwindcss(), menuApiPlugin()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.endsWith('menu_data.json')) return 'menu-data';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
}));
