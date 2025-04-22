import React, { useEffect, useState, useCallback } from "react";
import { Flex, type GetProp, Button, Tooltip, notification } from "antd";
import {
  UserOutlined,
  FireOutlined,
  FormOutlined,
  // SmileOutlined,
  // FrownOutlined,
} from "@ant-design/icons";
import { Bubble, Prompts } from "@ant-design/x";
import type { BubbleProps } from "@ant-design/x";
import { MessageInfo } from "@ant-design/x/es/use-x-chat";
import "@client/assets/markdown.less";
import MarkdownCustom from "@client/components/MarkdownCustom"; // 导入类型
import "./index.less";
import eventBus from "@client/hooks/eventMitt";
import { insertBrief } from "@client/api";
const host = import.meta.env.VITE_HOST;

interface BubbleListProps {
  messages: MessageInfo<string>[];
  isTyping: boolean;
  isTypingComplete: boolean;
}

interface BubbleItem {
  key: string | number;
  role: string;
  content: string | string[];
  className?: string;
  loading?: boolean;
}

const BubbleList: React.FC<BubbleListProps> = React.forwardRef(({ messages, isTyping, isTypingComplete }, ref) => {
  const [items, setItems] = useState<BubbleItem[]>([]);

  
  // 渲染 Markdown 时创建并存储引用
  const renderMarkdown: BubbleProps["messageRender"] = (content) => {
    return (
      <MarkdownCustom
        content={content} 
        isTypingComplete={isTypingComplete}
      />
    );
  };
  
  const handleGetNextSuggestionSuccess = useCallback((event: unknown) => {
    const data = event as string[];
    setItems((prev) => {
      return [
        ...prev,
        {
          key: "msg_suggestion_" + Math.random().toString(),
          role: "suggestion",
          content: data,
          className: "bubble-item",
        },
      ];
    });
  }, []);
  
  const setMessageLoading = useCallback(() => {
    if (messages.length === 0) return;
    const lastItem = messages[messages.length - 1];
    if (lastItem && lastItem.status === "local") {
      // 向items中添加一个loading状态的item
      setItems((prev) => {
        return [
          ...prev,
          {
            key: "msg_loading_" + Math.random().toString(),
            role: "ai",
            content: "正在加载...",
            loading: true,
            className: "bubble-item",
          },
        ];
      });
    } else if (
      lastItem &&
      typeof lastItem.id === "string" &&
      lastItem.id.includes("msg_loading_")
    ) {
      // 移除items中最后一个item
      setItems((prev) => {
        return prev.slice(0, -1);
      });
    }
  }, [messages]);
  
  useEffect(() => {
    eventBus.on("getNextSuggestionSuccess", handleGetNextSuggestionSuccess);
    return () => {
      eventBus.off("getNextSuggestionSuccess", handleGetNextSuggestionSuccess);
    };
  }, [handleGetNextSuggestionSuccess]);
  const handleInsertBrief = useCallback(async(index: number, bubbleRef: string) => {
    const markdownContainerEl = document.getElementById(bubbleRef);
    const markdownContent = markdownContainerEl?.querySelectorAll('.eoai-markdown');
   const res = await insertBrief({
      title: messages[index - 1].message,
      content: markdownContent![0].innerHTML || "<p>同步失败！</p>",
    });
    if (res.code === 200) {
      notification.success({
        message: "同步成功",
        placement: "top",
        description: (
          <div>
            <p>简报已经同步到本地<a href={`https://${host}.iyiou.com/work/intelligence/briefing/detail/${res.data.id || '123'}`} target="_blank" onClick={()=> {
              notification.destroy();
            }}>【立即查看】</a></p>
          </div>
        ),
      });
    }
  }, [messages]);
  
  useEffect(() => {
    setItems(
      messages.map(({ id, message, status }, index) => {
        const bubbleRef = Math.random().toString(32).slice(2);
        return {
          key: id,
          role: status === "local" ? "local" : "ai",
          content: message,
          className: "bubble-item",
          id: bubbleRef,
          footer: status !== "local" && (
          <Flex>
            <Tooltip title="一键插入简报">
              <Button onClick={() => handleInsertBrief(index, bubbleRef)} size="small" type="text" icon={<FormOutlined />} />
            </Tooltip>
          </Flex>
        )
      }
      })  
    );
    setMessageLoading();
  }, [messages, setMessageLoading, handleInsertBrief]);
  
  const handleItemClick = useCallback(
    (item: { data: { description: string } }) => {
      eventBus.emit("suggestionSendMessage", item.data);
    },
    []
  );
  
  const roles: GetProp<typeof Bubble.List, "roles"> = {
    ai: {
      placement: "start",
      avatar: {
        icon: (
          <img
            src={
              "https://diting-hetu.iyiou.com/TQYNHQEh0ZuqHAAo9FTc.png"
            }
            alt="avatar"
          />
        ),
      },
      typing: isTyping ? { step: 1, interval: 15 } : undefined,
      // typing: isTyping ? true : undefined,
      messageRender: renderMarkdown,
      onTypingComplete: () => {
        const lastItem = messages[messages.length - 1];
        if (messages.length > 0 && lastItem && lastItem.status === "success") {
          eventBus.emit("onTypingComplete");
        }
      },
      // footer: (
      //   <Flex>
      //     <Tooltip title="一键插入简报">
      //       <Button id={bubbleRef.current} onClick={handleInsertBrief} size="small" type="text" icon={<FormOutlined />} />
      //     </Tooltip>
      //     {/* <Button size="small" type="text" icon={<SmileOutlined />} />
      //     <Button size="small" type="text" icon={<FrownOutlined />} /> */}
      //   </Flex>
      // ),
    },
    local: {
      placement: "end",
      style: {},
    },
    suggestion: {
      placement: "start",
      avatar: {
        icon: <UserOutlined />,
        style: {
          visibility: "hidden",
        },
      },
      variant: "borderless",
      messageRender: (content) => (
        <Prompts
          vertical
          onItemClick={handleItemClick}
          items={content.map((text) => ({
            key: text,
            icon: (
              <FireOutlined
                style={{
                  color: "#FF4D4F",
                }}
              />
            ),
            description: text,
          }))}
        />
      ),
    },
  };

  return (
    <Bubble.List ref={ref} className="w-full h-full pb-[32px]" roles={roles} items={items} />
  );
});

export default BubbleList;