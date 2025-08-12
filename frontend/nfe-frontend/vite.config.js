import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5511,
    https: {
      key: fs.readFileSync("/etc/letsencrypt/live/gestao-api.dev.br/privkey.pem"),
      cert: fs.readFileSync("/etc/letsencrypt/live/gestao-api.dev.br/fullchain.pem"),
    },
    hmr: {
      protocol: 'wss',
      host: 'gestao-api.dev.br',
      port: 5511,
      clientPort: 5511,
    },
  },
})
