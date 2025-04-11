import React, { memo, useEffect, useState, useCallback } from 'react';
import { Flex, type GetProp } from 'antd';
import { UserOutlined, FireOutlined } from '@ant-design/icons';
import { Bubble, Prompts } from '@ant-design/x';
import type { BubbleProps } from '@ant-design/x';
import { MessageInfo } from '@ant-design/x/es/use-x-chat';
import '@client/assets/markdown.less';
import MarkdownCustom from '@client/components/MarkdownCustom';
import './index.less';
import eventBus from '@client/hooks/eventMitt';

const renderMarkdown: BubbleProps['messageRender'] = (content) => {
  return <MarkdownCustom content={content} />;
};

interface BubbleListProps {
  messages: MessageInfo<string>[];
  isTyping: boolean;
}

const BubbleList: React.FC<BubbleListProps> = memo(({ messages, isTyping }) => {
  const [items, setItems] = useState<unknown[]>([]);
  const handleGetNextSuggestionSuccess = useCallback((data: string[]) => {
    setItems((prev) => {
      return [
        ...prev,
        {
          key: 'msg_suggestion_' + Math.random().toString(),
          role: 'suggestion',
          content: data,
          className: 'bubble-item',
        },
      ];
    });
  }, []);
  useEffect(() => {
    eventBus.on('getNextSuggestionSuccess', handleGetNextSuggestionSuccess);
    return () => {
      eventBus.off('getNextSuggestionSuccess', handleGetNextSuggestionSuccess);
    };
  }, [handleGetNextSuggestionSuccess]);
  useEffect(() => {
    setItems(
      messages.map(({ id, message, status }) => ({
        key: id,
        role: status === 'local' ? 'local' : 'ai',
        content: message,
        className: 'bubble-item',
      }))
    );
  }, [messages]);
  const handleItemClick = useCallback(
    (item: { data: { description: string } }) => {
      eventBus.emit('suggestionSendMessage', item.data);
    },
    []
  );
  const roles: GetProp<typeof Bubble.List, 'roles'> = {
    ai: {
      placement: 'start',
      avatar: {
        icon: (
          <img
            src={
              'https://img.alicdn.com/imgextra/i1/O1CN012NfNOj1Tjx7VTw6rg_!!6000000002419-2-tps-72-72.png'
            }
            alt="avatar"
          />
        ),
      },
      typing: isTyping ? { step: 1, interval: 10 } : undefined,
      // typing: isTyping ? true : undefined,
      messageRender: renderMarkdown,
    },
    local: {
      placement: 'end',
      style: {},
    },
    suggestion: {
      placement: 'start',
      avatar: {
        icon: <UserOutlined />,
        style: {
          visibility: 'hidden',
        },
      },
      variant: 'borderless',
      messageRender: (content) => (
        <Prompts
          vertical
          onItemClick={handleItemClick}
          items={content.map((text) => ({
            key: text,
            icon: (
              <FireOutlined
                style={{
                  color: '#FF4D4F',
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
