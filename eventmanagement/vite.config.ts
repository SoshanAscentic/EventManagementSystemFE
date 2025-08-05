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
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    sourcemap: false,
    
    // Inline EVERYTHING possible
    assetsInlineLimit: 100000, // 100KB - inline almost all images
    
    // Use esbuild for fast minification
    minify: 'esbuild',
    
    rollupOptions: {
      output: {
        // FORCE everything into single files
        manualChunks: () => 'bundle',
        chunkFileNames: 'bundle.js',
        entryFileNames: 'bundle.js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'asset[extname]'
          
          if (assetInfo.name.endsWith('.css')) {
            return 'bundle.css'
          }
          
          // For any remaining assets, use simple names
          const ext = assetInfo.name.split('.').pop()
          return `asset.${ext}`
        }
      },
      
      // Aggressive tree shaking
      treeshake: {
        preset: 'smallest',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    
    // Additional optimizations
    commonjsOptions: {
      transformMixedEsModules: true
    },
    
    // Disable all splitting
    chunkSizeWarningLimit: 50000 // Suppress warnings for large bundles
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