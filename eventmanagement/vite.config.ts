import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // Make sure this matches your backend CORS configuration
    host: true, // Allow access from network
    proxy: {
      '/notificationHub': {
        target: 'https://localhost:7026',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
      },
      '/api': {
        target: 'https://localhost:7026',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})