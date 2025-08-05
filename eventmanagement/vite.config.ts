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
    // Disable source maps in production
    sourcemap: false,
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 2000,
    
    // Optimize asset inlining
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    
    rollupOptions: {
      output: {
        // Reduce the number of chunks by consolidating vendors
        manualChunks: {
          // Core React and routing
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Redux and API
          'state-vendor': ['@reduxjs/toolkit', 'react-redux'],
          
          // UI components - consolidate all Radix UI into one chunk
          'ui-vendor': [
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
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs'
          ],
          
          // Utilities - consolidate all utilities
          'utils-vendor': [
            'date-fns', 
            'clsx', 
            'tailwind-merge', 
            'sonner', 
            'lucide-react',
            'react-hook-form', 
            '@hookform/resolvers', 
            'zod',
            '@microsoft/signalr',
            '@tanstack/react-table'
          ]
        },
        
        // Simplify file naming to reduce total file count
        chunkFileNames: 'js/[hash].js',
        entryFileNames: 'js/[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return '[hash][extname]'
          
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[hash][extname]`
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `img/[hash][extname]`
          }
          return `[hash][extname]`
        }
      }
    },
    
    // Additional optimizations
    commonjsOptions: {
      transformMixedEsModules: true
    },
    
    // Minify more aggressively
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
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