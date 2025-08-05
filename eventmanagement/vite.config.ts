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
    sourcemap: false,
    chunkSizeWarningLimit: 5000,
    
    // Inline more assets to reduce file count
    assetsInlineLimit: 50000, // 50KB - very aggressive inlining
    
    rollupOptions: {
      output: {
        // Create only 2-3 chunks instead of many
        manualChunks: (id) => {
          // Only split into vendor and app - minimizes to ~3 files total
          if (id.includes('node_modules')) {
            // Keep heavy libraries separate for better caching
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor' // This will be your largest, most stable chunk
            }
            return 'vendor' // Everything else from node_modules
          }
          // All your app code in one chunk
          return 'app'
        },
        
        // Simple naming to minimize files
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'styles.css'
          }
          // Inline small assets, keep only essential ones
          return 'assets/[name][extname]'
        }
      }
    },
    
    commonjsOptions: {
      transformMixedEsModules: true
    },
    
    // Aggressive minification
    minify: 'terser',
  },
  
  // Alternative way to remove console logs
  esbuild: {
    drop: ['console', 'debugger'],
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