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

  base:"/",
  
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/notificationHub': {
        target: process.env.VITE_USE_LOCAL_API === 'true' 
          ? (process.env.VITE_LOCAL_API_URL)
          : (process.env.VITE_PRODUCTION_API_URL),
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/api': {
        target: process.env.VITE_USE_LOCAL_API === 'true'
          ? (process.env.VITE_LOCAL_API_URL)
          : (process.env.VITE_PRODUCTION_API_URL),
        changeOrigin: true,
        secure: false,
      }
    }
  }
})