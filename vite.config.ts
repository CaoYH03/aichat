import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite";
import path from 'path';
const basMap = {
  local: '/',
  development: 'https://dev-data.iyiou.com/ai-agent/',
  production: 'https://data.iyiou.com/ai-agent/',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: basMap[process.env.NODE_ENV as keyof typeof basMap],
  resolve: {
    alias: {
      '@client': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons', '@ant-design/x'],
          'markdown-vendor': ['react-markdown', 'remark-gfm', 'remark-breaks', 'rehype-raw'],
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 3000, // 指定端口，可选
    // proxy: {
    //   '/api': {
    //     // target: 'https://dev-apidata.iyiou.com/spa/llm',
    //     target: 'https://agi.iyiou.com/v1',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //   },
    // }
  },
  css: {
    modules: {
      localsConvention: 'camelCase', // 将类名转换为驼峰命名（可选）
      generateScopedName: '[name]__[local]__[hash:base64:5]', // 自定义类名生成规则
    },
  },
})
