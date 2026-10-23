import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': decodeURIComponent(new URL('./src', import.meta.url).pathname).replace(/^\/(\w:)/, '$1') } },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5080',
      '/health': 'http://127.0.0.1:5080',
    },
  },
});
