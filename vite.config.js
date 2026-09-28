import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'icons-vendor';
            }
            if (id.includes('recharts') || id.includes('chart.js')) {
              return 'charts-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:5000',
  //       changeOrigin: true,
  //     },
  //     '/uploads': {
  //       target: 'http://localhost:5000',
  //       changeOrigin: true,
  //     }
  //   }
  // }
  server: {
    proxy: {
      '/api': {
        target: 'https://api.mysocietysuite.com/',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://api.mysocietysuite.com/',
        changeOrigin: true,
      }
    }
  }
})
