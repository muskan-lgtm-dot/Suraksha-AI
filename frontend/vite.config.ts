import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,   // Vite-only dev mode runs on 5174 (avoid collision with unified 5173)
    host: true,
    proxy: {
      // Forward API calls to the FastAPI server running on 5173 (or 8000 if run separately)
      '/api': {
        target: 'http://127.0.0.1:5173',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:5173',
        changeOrigin: true,
      },
    },
  },
})
