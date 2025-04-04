import { useState } from 'react';
import axios from 'axios';
import { parseJsonFromCodeBlock } from '../utils';
interface ChatPanelProps {
  onHtmlGenerated: (html: string) => void;
}

const ChatPanel = ({ onHtmlGenerated }: ChatPanelProps) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const prompt = `你是一位专业的Web开发专家。请根据以下描述生成完整的网页代码：
${input}

请以JSON格式返回，包含以下三个字段：
- html: 包含完整的HTML结构
- css: 所有的CSS样式代码
- js: 所有的JavaScript交互代码

要求：
1. 代码要简洁、干净、响应式
2. CSS优先使用现代布局技术（Flexbox/Grid）
3. JavaScript代码要符合ES6+规范
4. 确保代码之间没有依赖冲突
5. 返回格式示例：
{
  "html": "<div>...</div>",
  "css": "css代码",
  "js": "js代码"
}`;


      const response = await axios.post('/api/completions', {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: input },
        ],
        stream: false,
      }, {
        headers: {
          'Authorization': 'Bearer sk-f6a9fd8c2e80495db0a7c19915e0c28a',
        },
      });
      const data = parseJsonFromCodeBlock(response.data.choices[0].message.content);
      // 组合HTML、CSS和JavaScript
      const combinedHtml = `
        <style>${data.css}</style>
        ${data.html}
        <script>${data.js}</script>
      `;
      onHtmlGenerated(combinedHtml);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">AI 对话区域</h2>
      <div className="flex-grow">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-[calc(100vh-280px)] p-4 border rounded mb-4 shadow-inner"
          placeholder="请描述您想要生成的 HTML 内容..."
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg shadow-md transition-colors ${
          loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
        } text-white font-semibold`}>
        {loading ? '生成中...' : '生成 HTML'}
      </button>
    </div>
  );
};

export default ChatPanel;
