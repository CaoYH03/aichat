import React from 'react';
interface CustomLinkProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: Element | any;
    href: string;
    children: React.ReactNode;
}
// 自定义链接组件
const MarkdownWithLink: React.FC<CustomLinkProps> = ({ href, children, ...props }) => {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        {...props}
      >
        {children}
      </a>
    );
  };

  export default MarkdownWithLink;