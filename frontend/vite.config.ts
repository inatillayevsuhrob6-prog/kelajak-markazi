import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ishlab chiqish rejimida /api so‘rovlari backendga yo‘naltiriladi
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
      '/sitemap.xml': 'http://localhost:8000',
      '/robots.txt': 'http://localhost:8000',
    },
  },
})
