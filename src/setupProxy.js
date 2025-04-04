const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.deepseek.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // 可以根据需要重写路径
      },
    })
  );
}; 