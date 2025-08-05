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
  build: {
    // Reduce the number of chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Group vendor libraries
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-alert-dialog', '@radix-ui/react-avatar', '@radix-ui/react-checkbox'],
          routing: ['react-router-dom'],
          state: ['@reduxjs/toolkit', 'react-redux'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize dependencies
    commonjsOptions: {
      transformMixedEsModules: true
    }
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