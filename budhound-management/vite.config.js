import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          table: ['@tanstack/react-table'],
          query: ['@tanstack/react-query'],
          ui: ['@headlessui/react'],
        },
      },
    },
  },
  server: {
    port: 3002,
    proxy: {
      '/jsonapi': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/budhound': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/oauth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/sites': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
});
