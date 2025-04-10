import { Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';   
import MarkdownWithCharts from './MarkdownWithCharts';
import MarkdownWithLink from './MarkdownWithLink';
 const MarkdownCustom: React.FC<{ content: string }> = ({ content }) => {
  
  return (
<Typography>
<div className="tongyi-markdown">
  <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: MarkdownWithCharts as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a: MarkdownWithLink as any,
  }}>{content}</ReactMarkdown>
</div>
</Typography>
  );
};

export default MarkdownCustom;