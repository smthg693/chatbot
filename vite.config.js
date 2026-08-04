import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Universal relative asset paths for both local dev and GitHub Pages
  build: {
    outDir: 'docs' // Outputs production build to /docs so GitHub Pages can serve it directly from main branch
  }
})
