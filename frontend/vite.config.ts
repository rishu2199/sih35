import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@':          `${import.meta.dirname}/src`,
      '@core':      `${import.meta.dirname}/src/core`,
      '@features':  `${import.meta.dirname}/src/features`,
      '@components':`${import.meta.dirname}/src/components`,
      '@types':     `${import.meta.dirname}/src/types`,
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the FastAPI backend during development
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
})
