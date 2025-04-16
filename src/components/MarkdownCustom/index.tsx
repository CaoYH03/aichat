import { Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import MarkdownWithCharts from './MarkdownWithCharts';
import MarkdownWithLink from './MarkdownWithLink';
// import MarkdownWithMermaid from './MarkdownWithMermaid';
const MarkdownCustom: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Typography>
      <div className="tongyi-markdown">
        <ReactMarkdown
          // disallowedElements={['summary']}
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            code: MarkdownWithCharts as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            a: MarkdownWithLink as any,
            // details: ({ children }: any) => <details open className="thinking-content">{children}</details>,            // pre: MarkdownWithMermaid as any,
            // class name 为 chat-loading 的 div 添加 loading 动画
            // details: ({ children }) => <>{children}</>, // 只渲染 details 标签的子节点
          }}>
          {content}
        </ReactMarkdown>
      </div>
    </Typography>
  );
};

export default MarkdownCustom;
