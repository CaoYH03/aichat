// 使用 mermaid react-markdown 插件
import React, { useEffect } from 'react';
import mermaid from 'mermaid';
interface CustomMermaidProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: Element | any;
    children: React.ReactNode;
}
// 自定义链接组件
const MarkdownWithMermaid: React.FC<CustomMermaidProps> = ({ children, ...props }) => {
    useEffect(() => {
        console.log('MarkdownWithMermaid');
        mermaid.initialize({
            startOnLoad: true,
        });
    }, []);
    if (
        props.children &&
        props.children.props &&
        props.children.props.className === 'language-mermaid'
    ) {
        return (
            <div className="mermaid">
                {props.children.props.children}
            </div>
        );
    }
    return <pre {...props} />;
};

export default MarkdownWithMermaid;