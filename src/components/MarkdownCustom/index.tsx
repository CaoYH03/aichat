import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import MarkdownWithLink from './MarkdownWithLink';

// 定义组件暴露的方法类型
export interface MarkdownCustomRef {
  clearTextLoading: () => void;
}

interface MarkdownCustomProps {
  content: string;
  isTypingComplete?: boolean; // 新增属性，用于标识对话是否已完成
}

const MarkdownCustom = forwardRef<MarkdownCustomRef, MarkdownCustomProps>(
  ({ content, isTypingComplete = false }, ref) => {
    const contentRef = useRef<string>('');
    const timerId = useRef<NodeJS.Timeout | null>(null);
    const markdownRef = useRef<HTMLDivElement>(null);
    
    // 清除加载指示器的方法
    const clearTextLoading = () => {
      if (!markdownRef.current) return;
      
      // 移除所有加载指示器
      const loadingIndicators = markdownRef.current.querySelectorAll('.loading-indicator');
      loadingIndicators.forEach(el => el.remove());
      
      // 清除计时器
      if (timerId.current) {
        clearTimeout(timerId.current);
        timerId.current = null;
      }
    };
    
    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      clearTextLoading
    }));
    
    // 在组件卸载时清除所有计时器
    useEffect(() => {
      return () => {
        clearTextLoading();
      };
    }, []);
    
    // 监听 isTypingComplete 变化
    useEffect(() => {
      if (isTypingComplete) {
        // 如果对话完成，清除 loading
        clearTextLoading();
      }
    }, [isTypingComplete]);
    
    // 追踪内容变化
    useEffect(() => {
      // 如果内容变化了，重置计时器
      if (content !== contentRef.current) {
        contentRef.current = content;
        
        // 清除之前的计时器
        if (timerId.current) {
          clearTimeout(timerId.current);
        }
        
        // 清除之前的 loading 指示器
        const existingIndicators = markdownRef.current?.querySelectorAll('.loading-indicator');
        existingIndicators?.forEach(el => el.remove());
        
        // 设置新的计时器
        timerId.current = setTimeout(() => {
          // 当超过300ms没有新内容时，显示加载指示器
          if (!isTypingComplete) { // 只有在对话未完成时才添加 loading
            addLoadingIndicator();
          }
        }, 300);
      }
      
      return () => {
        if (timerId.current) {
          clearTimeout(timerId.current);
        }
      };
    }, [content, isTypingComplete]);
    
    // 查找最后一个文本节点并添加加载指示器
    const addLoadingIndicator = () => {
      if (!markdownRef.current) return;
      
      // 移除之前的加载指示器
      const existingIndicators = markdownRef.current.querySelectorAll('.loading-indicator');
      existingIndicators.forEach(el => el.remove());
      
      // 递归查找最后一个文本节点
      const findLastTextNode = (element: Element): Text | null => {
        // 从后往前查找子节点
        for (let i = element.childNodes.length - 1; i >= 0; i--) {
          const node = element.childNodes[i];
          
          // 如果是文本节点且非空，返回该节点
          if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
            return node as Text;
          }
          
          // 如果是元素节点，递归查找
          if (node.nodeType === Node.ELEMENT_NODE) {
            const lastTextNode = findLastTextNode(node as Element);
            if (lastTextNode) {
              return lastTextNode;
            }
          }
        }
        
        return null;
      };
      
      // 找到最后一个有内容的文本节点
      const lastTextNode = findLastTextNode(markdownRef.current);
      
      if (lastTextNode && lastTextNode.parentNode) {
        // 创建加载指示器
        const indicator = document.createElement('div');
        // const indicator = document.createElement('span');
        indicator.className = 'loading-indicator';
        indicator.style.backgroundImage = 'url(https://diting-hetu.iyiou.com/0dbe1fb2da190c73fceecd45ea89fba6.gif)';
        indicator.style.backgroundSize = '100% 100%';
        indicator.style.backgroundRepeat = 'no-repeat';
        indicator.style.backgroundPosition = 'center';
        indicator.style.display = 'inline-block';
        indicator.style.width = '16px';
        indicator.style.height = '16px';
        indicator.style.lineHeight = '16px';
        indicator.style.position = 'relative';
        indicator.style.top = '2px';
        indicator.style.left = '-2px';
        // indicator.textContent = '...';
        // indicator.style.display = 'inline';
        // indicator.style.color = '#888';
        // indicator.style.animation = 'blink 1s infinite';
        
        // 插入到最后一个文本节点后
        lastTextNode.parentNode.insertBefore(indicator, lastTextNode.nextSibling);
        
        // 添加动画样式
        // if (!document.querySelector('#loading-indicator-style')) {
        //   const style = document.createElement('style');
        //   style.id = 'loading-indicator-style';
        //   style.textContent = `
        //     @keyframes blink {
        //       0% { opacity: 0.2; }
        //       50% { opacity: 1; }
        //       100% { opacity: 0.2; }
        //     }
        //   `;
        //   document.head.appendChild(style);
        // }
      }
    };
    
    return (
      <Typography>
        <div className="eoai-markdown" ref={markdownRef}>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              a: MarkdownWithLink as any,
              img: ({ src, alt }) => {
                return <div className="eoai-markdown-img">
                  <img 
                    src={src || 'https://api.ditings.iyiou.com/assets/admin/qi.png'} 
                    alt={alt} 
                    onError={(e) => {
                      e.currentTarget.src = 'https://api.ditings.iyiou.com/assets/admin/qi.png';
                    }} 
                  />
                </div>;
              },
            }}>
            {content}
          </ReactMarkdown>
        </div>
      </Typography>
    );
  }
);

export default MarkdownCustom;