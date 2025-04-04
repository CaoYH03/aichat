import BubbleList from '@client/components/Bubble';
import { Sender } from '@ant-design/x';
import { useState } from 'react';
import { useXAgent, useXChat, XStream } from '@ant-design/x';
// 聊天页面
const Chat = () => {
  const [content, setContent] = useState('');
    // Agent for request
    const [agent] = useXAgent({
      request: async ({ message }, { onUpdate, onSuccess }) => {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-e18e5dcc58c8407099157c2ee44ff22d'
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: message }],
            model: 'deepseek-chat',
            stream: true,
          }),
        });
        if (!response.body) {
          throw new Error('No response body');
        }
        let content = '';
        for await (const chunk of XStream({
          readableStream: response.body,
        })) {
          if(!chunk.data.includes('[DONE]')){
            const parsedChunk = JSON.parse(chunk.data);
            const newContent = parsedChunk.choices[0].delta.content || '';
            content += newContent;
            onUpdate(content);
          }else{
            onSuccess(content);
          }
        }
    },
});
  // Chat messages
  const { onRequest, messages } = useXChat({
    agent,
  });

  return (
    <div className="max-w-[var(--main-max-width)] min-h-screen mx-auto flex flex-col items-center justify-center gap-24 relative p-24">
      <div className="w-full h-full">
        <BubbleList messages={messages} />
      </div>
      <Sender
        loading={agent.isRequesting()}
        value={content}
        onChange={setContent}
        onSubmit={(nextContent) => {
          onRequest(nextContent);
          setContent('');
        }}
      />
    </div>
  );
};

export default Chat;