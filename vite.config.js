import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API_BASE_URL = 'http://10.123.111.78:8080'
const backendOrigin = new URL(API_BASE_URL).origin

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(backendOrigin),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: backendOrigin,
        changeOrigin: true,
      },
      '/health': {
        target: backendOrigin,
        changeOrigin: true,
      },
    },
  },
})

