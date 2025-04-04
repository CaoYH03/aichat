const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 启用 CORS
app.use(cors());

// 代理配置
app.use('/api', createProxyMiddleware({
  target: 'https://api.deepseek.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`代理服务器运行在端口 ${PORT}`);
}); 