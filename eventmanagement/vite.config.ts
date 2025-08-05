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
    chunkSizeWarningLimit: 5000,
    
    // Optimize asset inlining - inline more assets to reduce file count
    assetsInlineLimit: 10240, // Inline assets smaller than 10KB instead of 4KB
    
    rollupOptions: {
      // Tree shaking for smaller bundles
      treeshake: {
        preset: 'safest'
      },
      output: {
        // Aggressive chunking - create fewer, larger chunks
        manualChunks: (id) => {
          // Bundle everything into fewer chunks
          if (id.includes('node_modules')) {
            // Put all vendor code into a single chunk
            return 'vendor'
          }
          // All app code goes into the main chunk
          return 'main'
        },
        
        // Minimize file count with simple naming
        chunkFileNames: 'js/[hash].js',
        entryFileNames: 'js/[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return '[hash][extname]'
          
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[hash][extname]`
          }
          // Inline all images or put them in a single directory
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/[hash][extname]`
          }
          return `assets/[hash][extname]`
        }
      }
    },
    
    // Additional optimizations
    commonjsOptions: {
      transformMixedEsModules: true
    },
    
    // Minimize CSS
    cssMinify: true
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