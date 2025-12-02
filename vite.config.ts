import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://api.fourthofficial.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path
      }
    }
  }
})