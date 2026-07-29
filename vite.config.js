import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Đảm bảo chạy đúng khi deploy lên Github Pages (đường dẫn tương đối)
})
