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
    port: 5173,
    host: true,
    proxy: {
      '/notificationHub': {
        target: process.env.VITE_USE_LOCAL_API === 'true' 
          ? (process.env.VITE_LOCAL_API_URL || 'https://localhost:7026')
          : (process.env.VITE_PRODUCTION_API_URL || 'https://wa-eventhub-backend-dev-southeastasia-g9f8ebhrech0g9ff.southeastasia-01.azurewebsites.net'),
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/api': {
        target: process.env.VITE_USE_LOCAL_API === 'true'
          ? (process.env.VITE_LOCAL_API_URL || 'https://localhost:7026')
          : (process.env.VITE_PRODUCTION_API_URL || 'https://wa-eventhub-backend-dev-southeastasia-g9f8ebhrech0g9ff.southeastasia-01.azurewebsites.net'),
        changeOrigin: true,
        secure: false,
      }
    }
  }
})