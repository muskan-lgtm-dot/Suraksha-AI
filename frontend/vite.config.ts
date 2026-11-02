import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In production/unified mode, FastAPI serves the built frontend on port 5173.
// The proxy below is only used when running `npm run dev` directly (Vite-only dev server).
// In that case, forward /api and /health to the FastAPI process running on port 8000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,           // Vite-only dev server runs on 5174 to avoid colliding with unified 5173
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
