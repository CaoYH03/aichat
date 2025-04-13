import BubbleList from '@client/components/Bubble';
import { Sender } from '@ant-design/x';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useXAgent, useXChat, XStream } from '@ant-design/x';
import { motion } from 'framer-motion';
import { chatMessage, checkSession, getNextSuggestion } from '@client/api';
import './index.less';
import eventBus from '@client/hooks/eventMitt';
import type { MessageInfo, MessageStatus } from '@ant-design/x/es/use-x-chat';
import { addSearchParams } from '@client/utils';

interface ChatMessage {
  query: string;
  agentThoughts: Array<{ thought: string }>;
  agent_thoughts: Array<{ thought: string }>;
}

// 聊天页面
const Chat = () => {
  const [content, setContent] = useState('');
  const [taskId, setTaskId] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [messageId, setMessageId] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const abortRef = useRef(() => {});
  const currentTaskIdRef = useRef('');
  const currentConversationIdRef = useRef('');
  const currentMessageIdRef = useRef('');
  const BubbleListRef = useRef<HTMLDivElement>(null);
  // 请求代理
  const [agent] = useXAgent({
    request: async ({ message }, { onUpdate, onSuccess }) => {
      const response = await chatMessage({
        inputs: {},
        query: message,
        response_mode: 'streaming',
        conversation_id: currentConversationIdRef.current,
        user: 'abc',
        files: [],
      });
      if (!response.body) {
        throw new Error('No response body');
      }
      let content = '';
      const stream = XStream({
        readableStream: response.body,
      });

      // 在循环前获取 reader
      const reader = stream.getReader();

      // 保存取消函数
      abortRef.current = () => {
        reader.cancel();
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            onSuccess(content);
            // handleGetNextSuggestion();
            eventBus.emit('requestSessionList', true);
            break;
          }

          try {
            const parsedChunk = JSON.parse(value.data);
            if (!parsedChunk.event.includes('message_end')) {
              if (parsedChunk.task_id !== currentTaskIdRef.current) {
                setTaskId(parsedChunk.task_id);
              }
              if (
                parsedChunk.conversation_id !== currentConversationIdRef.current
              ) {
                setConversationId(parsedChunk.conversation_id);
              }
              if (parsedChunk.message_id !== currentMessageIdRef.current) {
                setMessageId(parsedChunk.message_id);
              }
              if (parsedChunk.event.includes('agent_thought')) {
                // 将agent_thought 的 thought 添加到content中
                // content += `<div class="agent-thought">${parsedChunk.tool_input}</div>`;
              }
              const newContent = parsedChunk.answer || '';
              content += newContent;
              onUpdate(content);
            }
          } catch (error) {
            console.error(error);
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  });
  // 数据管理
  const { onRequest, parsedMessages: messages, setMessages } = useXChat({
    agent,
  });
  // 初始化请求会话
  useEffect(() => {
    const initSession = async () => {
      const url = new URL(window.location.href);
      const id = url.searchParams.get('conversationId');
      if (id) {
        setConversationId(id);
        const { data } = await checkSession(id);
        // setMessageList(formatMessageList(data));
        setMessages(formatMessageList(data));
        setIsTyping(false);
      }
    };
    initSession();
  }, [setMessages]);
  // 保存 taskId
  useEffect(() => {
    if (taskId) {
      currentTaskIdRef.current = taskId;
    }
  }, [taskId]);
  // 保存 conversationId
  useEffect(() => {
    if (conversationId) {
      currentConversationIdRef.current = conversationId;
      addSearchParams('conversationId', conversationId);
    } else {
      currentConversationIdRef.current = '';
    }
  }, [conversationId]);
  // 保存 messageId
  useEffect(() => {
    if (messageId) {
      currentMessageIdRef.current = messageId;
    }
  }, [messageId]);

  const handleChange = useCallback((e: string) => {
    setContent(e);
  }, []);
  // const handleCancel = () => {
  //   abortRef.current();
  //   stopChat(taskId, {
  //     user: 'abc',
  //   });
  // };
  const handleSubmit = (nextContent: string) => {
    setIsTyping(true);
    onRequest(nextContent);
    setContent('');
  };
  // 检查会话
  const handleCheckSession = useCallback(async (event: unknown) => {
    const sessionId = event as string;
    const { data } = await checkSession(sessionId);
    setMessages(formatMessageList(data));
    setConversationId(sessionId);
    setIsTyping(false);
  }, [setMessages]);
  // 创建会话
  const handleCreateSession = useCallback(async () => {
    setMessages([]);
    setIsTyping(true);
    setConversationId('');
    // 清空 URL 中的 conversationId 参数
    const url = new URL(window.location.href);
    url.searchParams.delete('conversationId');
    window.history.replaceState({}, '', url.toString());
  }, [setMessages]);
  // 处理会话建议
  const handleSuggestionSendMessage = useCallback((data: { description: string; }) => {
    onRequest(data.description);
  }, [onRequest]);
  useEffect(() => {
    eventBus.on('checkSession', handleCheckSession);
    return () => {
      abortRef.current();
      eventBus.off('checkSession', handleCheckSession);
    };
  }, [handleCheckSession]);
  useEffect(() => {
    eventBus.on('createSession', handleCreateSession);
    return () => {
      eventBus.off('createSession', handleCreateSession);
    };
  }, [handleCreateSession]);
  useEffect(() => {
    eventBus.on('suggestionSendMessage', handleSuggestionSendMessage);
    return () => {
      eventBus.off('suggestionSendMessage', handleSuggestionSendMessage);
    };
  }, [handleSuggestionSendMessage]);
  const formatMessageList = (data: ChatMessage[]) => {
    const messageList: MessageInfo<string>[] = [];
    if (data.length > 0) {
      data.forEach((item: ChatMessage, index: number) => {
        messageList.push(
          // local
          {
            id: `msg_${index + Math.random().toString()}`,
            message: item.query,
            status: 'local' as MessageStatus,
          },
          // ai
          {
            id: `msg_${index + Math.random().toString()}`,
            message: (item.agentThoughts || item.agent_thoughts)
              .map((t: { thought: string }) => t.thought)
              .join(''),
            status: 'ai' as MessageStatus,
          }
        );
      });
    }
    return messageList;
  };
  // 获取下一轮会话建议
  const handleGetNextSuggestion = useCallback(async () => {
    if (currentMessageIdRef.current) {
      const res = await getNextSuggestion(currentMessageIdRef.current);
      if (res.result === 'success' && res.data && res.data.length > 0) {
        eventBus.emit('getNextSuggestionSuccess', res.data);
      }
    }
  }, []);
  useEffect(() => {
    eventBus.on('onTypingComplete', handleGetNextSuggestion);
    return () => {
      eventBus.off('onTypingComplete', handleGetNextSuggestion);
    };
  }, [handleGetNextSuggestion]);

  return (
    <>
      <div className="w-full h-full box-border p-[32px_8px]">
        <div className="h-full flex flex-col items-center justify-between gap-12">
          <div
            ref={BubbleListRef}
            className="w-full h-full flex-1 overflow-scroll">
            <BubbleList messages={messages} isTyping={isTyping} />
          </div>
          <div className="w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}>
              <Sender
                className="w-[896px]! max-w-[896px] min-w-[320px]"
                loading={agent.isRequesting()}
                value={content}
                onChange={handleChange}
                // onCancel={handleCancel}
                onSubmit={handleSubmit}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
