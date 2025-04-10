import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Configuração de proxy para redirecionar as requisições da API
      '/api': {
        target: 'http://localhost:8000', // Endereço do backend atualizado para porta 8000
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove o prefixo /api das requisições
      },
    },
    cors: true
  },
})
