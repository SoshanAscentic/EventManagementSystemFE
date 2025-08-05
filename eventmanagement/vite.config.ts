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
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          
          // Routing and state management
          'app-core': ['react-router-dom', '@reduxjs/toolkit', 'react-redux'],
          
          // UI library - group all Radix components
          'ui-components': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar', 
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast'
          ],
          
          // Form handling
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utilities
          'utils': ['date-fns', 'clsx', 'tailwind-merge', 'sonner'],
          
          // SignalR
          'signalr': ['@microsoft/signalr']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Handle undefined name case
          if (!assetInfo.name) {
            return 'assets/[name]-[hash][extname]'
          }
          
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`
          }
          return `assets/${ext}/[name]-[hash][extname]`
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    // Reduce asset inlining to avoid too many small files
    assetsInlineLimit: 0
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