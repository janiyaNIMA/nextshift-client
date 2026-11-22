import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://10.123.111.78:8080',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://10.123.111.78:8080',
        changeOrigin: true,
      },
    },
  },
})

