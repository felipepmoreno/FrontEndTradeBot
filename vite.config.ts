import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Configuração de proxy para redirecionar as requisições da API
      '/api': {
        target: 'http://localhost:5000', // Endereço do backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
