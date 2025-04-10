import React, { memo } from 'react';
import { Flex, type GetProp } from 'antd';
import { Bubble } from '@ant-design/x';
import type { BubbleProps } from '@ant-design/x';
import { MessageInfo } from '@ant-design/x/es/use-x-chat';
import '@client/assets/markdown.less';
import MarkdownCustom from '@client/components/MarkdownCustom';
import './index.less';

const renderMarkdown: BubbleProps['messageRender'] = (content) => {
  console.log('content', content);
  return <MarkdownCustom content={content} />;
};

interface BubbleListProps {
  messages: MessageInfo<string>[];
  isTyping: boolean;
}

const BubbleList: React.FC<BubbleListProps> = memo(({ messages, isTyping }) => {
  const roles: GetProp<typeof Bubble.List, 'roles'> = {
    ai: {
      placement: 'start',
      avatar: { icon: <img src={'https://img.alicdn.com/imgextra/i1/O1CN012NfNOj1Tjx7VTw6rg_!!6000000002419-2-tps-72-72.png'} alt="avatar" />},
      typing: isTyping ? { step: 1, interval: 20 } : undefined,
    },
    local: {
      placement: 'end',
    },
  };
  return (
    <Flex gap="middle" vertical>
      <Bubble.List
        roles={roles}
        items={messages.map((item) => ({
          key: item.id,
          role: item.status === 'local' ? 'local' : 'ai',
          content: item.message,
          messageRender: renderMarkdown,
          className: 'bubble-item',
        }))}
      />
    </Flex>
  );
});

export default BubbleList;
