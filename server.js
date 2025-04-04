const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/chat', (req, res) => {
  const { message } = req.body;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 模拟AI响应的流式返回
  const response = '这是一个AI的回复，我们正在使用SSE实现流式响应。让我们来测试一下打字机效果！';
  let index = 0;

  const interval = setInterval(() => {
    if (index < response.length) {
      res.write(`data: ${JSON.stringify({ text: response[index] })}\n\n`);
      index++;
    } else {
      clearInterval(interval);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }, 100);

  req.on('close', () => {
    clearInterval(interval);
  });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});