import React, { memo, useEffect, useState, useCallback } from "react";
import { Flex, type GetProp, Button } from "antd";
import {
  UserOutlined,
  FireOutlined,
  SyncOutlined,
  SmileOutlined,
  FrownOutlined,
} from "@ant-design/icons";
import { Bubble, Prompts } from "@ant-design/x";
import type { BubbleProps } from "@ant-design/x";
import { MessageInfo } from "@ant-design/x/es/use-x-chat";
import "@client/assets/markdown.less";
import MarkdownCustom from "@client/components/MarkdownCustom";
import "./index.less";
import eventBus from "@client/hooks/eventMitt";

const renderMarkdown: BubbleProps["messageRender"] = (content) => {
  return <MarkdownCustom content={content} />;
};

interface BubbleListProps {
  messages: MessageInfo<string>[];
  isTyping: boolean;
}

interface BubbleItem {
  key: string | number;
  role: string;
  content: string | string[];
  className?: string;
}

const BubbleList: React.FC<BubbleListProps> = memo(({ messages, isTyping }) => {
  const [items, setItems] = useState<BubbleItem[]>([]);
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
    eventBus.emit("cancelScroll");
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
  useEffect(() => {
    setItems(
      messages.map(({ id, message, status }) => ({
        key: id,
        role: status === "local" ? "local" : "ai",
        content: message,
        className: "bubble-item",
      }))
    );
    setMessageLoading();
  }, [messages, setMessageLoading]);
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
              "https://img.alicdn.com/imgextra/i1/O1CN012NfNOj1Tjx7VTw6rg_!!6000000002419-2-tps-72-72.png"
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
      footer: (
        <Flex>
          <Button
            size="small"
            type="text"
            icon={<SyncOutlined />}
            style={{ marginInlineEnd: "auto" }}
          />
          <Button size="small" type="text" icon={<SmileOutlined />} />
          <Button size="small" type="text" icon={<FrownOutlined />} />
        </Flex>
      ),
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
    <Flex gap="middle" vertical>
      <Bubble.List roles={roles} items={items} />
    </Flex>
  );
});

export default BubbleList;
