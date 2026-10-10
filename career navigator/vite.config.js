import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.CAREER_NAVIGATOR_API_TARGET || 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.CAREER_NAVIGATOR_API_TARGET || 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});
