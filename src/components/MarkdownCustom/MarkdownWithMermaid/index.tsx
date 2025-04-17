// 使用 mermaid react-markdown 插件
import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
interface CustomMermaidProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: Element | any;
  children: React.ReactNode;
  className: string;
}
// 自定义链接组件
const MarkdownWithMermaid: React.FC<CustomMermaidProps> = ({
  className,
  children,
  ...props
}) => {
  const mermainIdRef = useRef('');
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);
  useEffect(() => {
    setTimeout(() => {
      mermaid.contentLoaded();
    }, 1000);
  }, []);
  if (className === 'language-mermaid') {
    return (
      <pre id={mermainIdRef.current} className="mermaid" {...props}>
        {children}
      </pre>
    );
  } else {
    return (
      <pre className={className} {...props}>
        <code>{children}</code>
      </pre>
    );
  }
};

export default MarkdownWithMermaid;
