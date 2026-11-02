import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In Vercel Services dev mode, `vercel dev` binds all services to one port
// and injects the dev proxy automatically. The proxy below is used only when
// running `npm run dev` directly (outside of vercel dev).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5173',
        changeOrigin: true
      },
      '/health': {
        target: 'http://127.0.0.1:5173',
        changeOrigin: true
      }
    }
  }
})
