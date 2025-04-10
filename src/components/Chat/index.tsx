import BubbleList from '@client/components/Bubble';
import { Sender } from '@ant-design/x';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useXAgent, useXChat, XStream } from '@ant-design/x';
import { motion } from 'framer-motion';
import { chatMessage, stopChat, checkSession, getNextSuggestion } from '@client/api';
import './index.less';
import eventBus from '@client/hooks/eventMitt';
import type { MessageInfo, MessageStatus } from '@ant-design/x/es/use-x-chat';
import { addSearchParams } from '@client/utils';

interface ChatMessage {
  query: string;
  agentThoughts: Array<{ thought: string }>;
}

// 聊天页面
const Chat = () => {
  const [content, setContent] = useState('');
  const [taskId, setTaskId] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [messageId, setMessageId] = useState('');
  const [messageList, setMessageList] = useState<MessageInfo<string>[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const abortRef = useRef(() => {});
  const currentTaskIdRef = useRef('');
  const currentConversationIdRef = useRef('');
  const currentMessageIdRef = useRef('');
  // 初始化请求会话
  useEffect(() => {
    const initSession = async () => {
      const url = new URL(window.location.href);
      const id = url.searchParams.get('conversationId');
      if (id) {
        setConversationId(id);
        const { data } = await checkSession(id);
        setMessageList(formatMessageList(data));
        setIsTyping(false);
      }
    };
    initSession();
  }, []);
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
      eventBus.emit('requestSessionList');
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

  // 请求代理
  const [agent] = useXAgent({
    request: async ({ message }, { onUpdate, onSuccess }) => {
      const response = await chatMessage({
        inputs: {},
        query: message,
        response_mode: 'streaming',
        conversation_id: currentConversationIdRef.current,
        user: 'abc-123',
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
            handleGetNextSuggestion();
            break;
          }

          try {
            const parsedChunk = JSON.parse(value.data);
            if (!parsedChunk.event.includes('message_end')) {
              if (!currentTaskIdRef.current) {
                setTaskId(parsedChunk.task_id);
              }
              if (!currentConversationIdRef.current) {
                setConversationId(parsedChunk.conversation_id);
              }
              if (!currentMessageIdRef.current) {
                setMessageId(parsedChunk.message_id);
              }
              const newContent = parsedChunk.answer || '';
              content += newContent;
              onUpdate(content);
            }
            //  else {
            //   onSuccess(content);
            // }
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
  const { onRequest, messages } = useXChat({
    agent,
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      setMessageList((prevMessages) => {
        const lastMessage = messages[messages.length - 1];
        if (
          prevMessages.length > 0 &&
          prevMessages[prevMessages.length - 1].id === lastMessage.id
        ) {
          // 更新最后一条消息
          return [...prevMessages.slice(0, -1), lastMessage];
        } else {
          // 添加新消息
          return [...prevMessages, lastMessage];
        }
      });
    }
  }, [messages]);

  const handleChange = useCallback((e: string) => {
    setContent(e);
  }, []);
  const handleCancel = () => {
    abortRef.current();
    stopChat(taskId, {
      user: 'abc-123',
    });
  };
  const handleSubmit = (nextContent: string) => {
    setIsTyping(true);
    onRequest(nextContent);
    setContent('');
  };
  // 检查会话
  const handleCheckSession = useCallback(async (event: unknown) => {
    const sessionId = event as string;
    const { data } = await checkSession(sessionId);
    setMessageList(formatMessageList(data));
    setConversationId(sessionId);
    setIsTyping(false);
  }, []);
  // 创建会话
  const handleCreateSession = useCallback(async () => {
      setMessageList([]);
      setIsTyping(true);
      setConversationId('');
      // 清空 URL 中的 conversationId 参数
      const url = new URL(window.location.href);
      url.searchParams.delete('conversationId');
      window.history.replaceState({}, '', url.toString());
  }, []);
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
            message: item.agentThoughts
              .map((t: { thought: string }) => t.thought)
              .join(''),
            status: 'assistant' as MessageStatus,
          }
        );
      });
    }
    return messageList;
  };
  // 获取下一轮会话建议
  const handleGetNextSuggestion = useCallback(async () => {
    if (currentMessageIdRef.current) {
      const { data } = await getNextSuggestion(currentMessageIdRef.current);
      console.log('data', data);
    }
  }, []);

  return (
    <>
        <div className="w-full h-full box-border p-[32px_8px]">
      <div className="h-full flex flex-col items-center justify-between gap-12">
        <div className="w-full h-full flex-1 overflow-scroll">
          <BubbleList messages={messageList} isTyping={isTyping} />
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
              onCancel={handleCancel}
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
