import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Flex, type GetProp } from 'antd';
import { Bubble } from '@ant-design/x';
import type { BubbleProps } from '@ant-design/x';
import markdownit from 'markdown-it';
import { Typography } from 'antd';
import { MessageInfo } from '@ant-design/x/es/use-x-chat';
const md = markdownit({ html: true, breaks: true });
const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
    typing: { step: 5, interval: 20 },
    style: {
      maxWidth: 600,
    },
  },
  local: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
  },
};
const renderMarkdown: BubbleProps['messageRender'] = (content) => (
  <Typography>
    {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
    <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
  </Typography>
);

interface BubbleListProps {
  messages: MessageInfo<string>[];
}

const BubbleList: React.FC<BubbleListProps> = ({ messages }) => {
  return (
    <Flex gap="middle" vertical>
      <Bubble.List
      roles={roles}
      items={messages.map((item) => ({
        key: item.id,
        role: item.status === 'local' ? 'local' : 'ai',
        content: item.message,
        messageRender: renderMarkdown,
      }))}
      >

      </Bubble.List>
    </Flex>
  );
};

export default BubbleList;
