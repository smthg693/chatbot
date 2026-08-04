import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/chatbot/', // Matches your GitHub repository name: https://smthg693.github.io/chatbot/
  build: {
    outDir: 'docs' // Outputs production build to /docs so GitHub Pages can serve it directly from the main branch
  }
})
