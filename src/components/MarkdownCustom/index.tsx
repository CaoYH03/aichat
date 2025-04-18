import { Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
// import MarkdownWithCharts from './MarkdownWithCharts';
import MarkdownWithLink from './MarkdownWithLink';
// import MarkdownWithMermaid from './MarkdownWithMermaid';

const MarkdownCustom: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Typography>
      <div className="tongyi-markdown">
        <ReactMarkdown
          // disallowedElements={['summary']}
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            // code: MarkdownWithMermaid as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            a: MarkdownWithLink as any,
            // details: ({ children }: any) => <details open className="thinking-content">{children}</details>,            // pre: MarkdownWithMermaid as any,
            // class name 为 chat-loading 的 div 添加 loading 动画
            // details: ({ children }) => <>{children}</>, // 只渲染 details 标签的子节点
            p: ({ children }) => {
              if (
                typeof children === 'string' &&
                (children.includes('Action:') ||
                  children.includes('Observation:') ||
                  children.includes('Thought:'))
              ) {
                return (
                  <div className="tongyi-markdown-p">
                    {children
                      .replace('Action:', '')
                      .replace('Observation:', '')
                      .replace('Thought:', '')}
                  </div>
                );
              }
              return <div className="tongyi-markdown-p">{children}</div>;
            },
            img: ({ src, alt }) => {
              return <div className="tongyi-markdown-img">
                <img src={src || 'https://api.ditings.iyiou.com/assets/admin/qi.png'} alt={alt} onError={(e) => {
                  e.currentTarget.src = 'https://api.ditings.iyiou.com/assets/admin/qi.png';
                }} />
              </div>;
            },
          }}>
          {content
          .replace(/<\/details>/g, '</details>\n\n')}
        </ReactMarkdown>
      </div>
    </Typography>
  );
};

export default MarkdownCustom;
