import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite";
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@client': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 3000, // 指定端口，可选
    proxy: {
      '/api': {
        // target: 'https://dev-apidata.iyiou.com/spa/llm',
        target: 'https://agi.iyiou.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
