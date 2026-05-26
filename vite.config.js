// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // लोकल रन करने के लिए पोर्ट
    open: true  // 'npm run dev' करने पर ब्राउज़र अपने आप खुल जाएगा
  }
})