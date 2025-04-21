import BubbleList from '@client/components/Bubble';
import Prompt from '@client/components/Prompt';
import ScrollToBottom from '@client/components/ScrollToBottom';
import { Sender } from '@ant-design/x';
import { Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useXAgent, useXChat, XStream } from '@ant-design/x';
import { motion } from 'framer-motion';
import {
  chatMessage,
  checkSession,
  getNextSuggestion,
  stopChat,
} from '@client/api';
import './index.less';
import eventBus from '@client/hooks/eventMitt';
import type { MessageInfo, MessageStatus } from '@ant-design/x/es/use-x-chat';
import { addSearchParams } from '@client/utils';
import { useIsLogin } from '@client/hooks/useIsLogin';
import { h } from 'node_modules/framer-motion/dist/types.d-B50aGbjN';

interface ChatMessage {
  query: string;
  agentThoughts: Array<{ thought: string; observation: string; tool: string }>;
  agent_thoughts: Array<{ thought: string }>;
  answer: string;
}
// 格式化消息列表
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
          message: item.answer,
          status: 'ai' as MessageStatus,
        }
      );
    });
  }
  return messageList;
};
// 滚动到底部
const scrollToBottom = (el: HTMLDivElement) => {
  const elDom = el.nativeElement;
  setTimeout(() => {
  elDom.scrollTop = elDom.scrollHeight;
  }, 100);
};

// 聊天页面
const Chat = () => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(true);
  const abortRef = useRef(() => {});
  const currentTaskIdRef = useRef('');
  const currentConversationIdRef = useRef('');
  const currentMessageIdRef = useRef('');
  const BubbleListRef = useRef<HTMLDivElement | null>(null);
  const GlobalSearchStatusRef = useRef(true);
  useEffect(() => {
    eventBus.on('globalSearch', (event: unknown) => {
      const status = event as boolean;
      console.log('status', status);
      if(GlobalSearchStatusRef.current === status) {
        return;
      }
      GlobalSearchStatusRef.current = status;
    });
    return () => {
      eventBus.off('globalSearch');
    };
  }, []);
  const [isLogin] = useIsLogin();
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
            eventBus.emit('requestSessionList', true);
            break;
          }

          try {
            const parsedChunk = JSON.parse(value.data);
            if (!parsedChunk.event.includes('message_end')) {
              if (parsedChunk.task_id !== currentTaskIdRef.current) {
                currentTaskIdRef.current = parsedChunk.task_id;
              }
              if (
                parsedChunk.conversation_id !== currentConversationIdRef.current
              ) {
                currentConversationIdRef.current = parsedChunk.conversation_id;
                // 添加conversationId到url中
                addSearchParams('conversationId', parsedChunk.conversation_id);
              }
              if (parsedChunk.message_id !== currentMessageIdRef.current) {
                currentMessageIdRef.current = parsedChunk.message_id;
              }
              // if (parsedChunk.event.includes('agent_thought')) {
              //   // 将agent_thought 的 thought 添加到content中
              //   content += `<div class="agent-thought">${
              //     parsedChunk.observation || ''
              //   }</div>`;
              // }
              const newContent = parsedChunk.answer || '';
              content += newContent;
              onUpdate(content);
            }
          } catch (error) {
            console.error(error);
          }
        }
      } finally {
        // 释放锁
        reader.releaseLock();
      }
    },
  });
  // 数据管理
  const {
    onRequest,
    parsedMessages: messages,
    setMessages,
  } = useXChat({
    agent,
  });
  const handleGlobalSearch = () => {
    console.log('handleGlobalSearch');
    GlobalSearchStatusRef.current = !GlobalSearchStatusRef.current;
    console.log('GlobalSearchStatusRef.current', GlobalSearchStatusRef.current);
    eventBus.emit('globalSearch', GlobalSearchStatusRef.current);
  }
    // 创建会话
    const handleCreateSession = useCallback(async () => {
      setMessages([]);
      setIsTyping(true);
      currentConversationIdRef.current = '';
      // 清空 URL 中的 conversationId 参数
      const url = new URL(window.location.href);
      url.searchParams.delete('conversationId');
      window.history.replaceState({}, '', url.toString());
    }, [setMessages]);
  // 初始化请求会话
  useEffect(() => {
    const initSession = async () => {
      const url = new URL(window.location.href);
      const id = url.searchParams.get('conversationId');
      if (!isLogin) {
        sessionStorage.setItem('preConversationId', id || '');
        return;
      }
      if (id) {
        currentConversationIdRef.current = id;
        const { data } = await checkSession(id);
        if (data && data.length > 0) {
          setMessages(formatMessageList(data));
          setIsTyping(false);
        } else {
          handleCreateSession();
        }
      }
    };
    initSession();
  }, [setMessages, isLogin, handleCreateSession]);
  // 输入框内容变化
  const handleChange = useCallback((e: string) => {
    setContent(e);
  }, []);
  // 点击取消
  const handleCancel = () => {
    abortRef.current();
    stopChat(currentTaskIdRef.current, {
      user: 'abc',
    });
  };
  // 点击发送
  const handleSubmit = (nextContent: string) => {
    console.log('nextContent', nextContent);
    setIsTyping(true);
    onRequest(nextContent);
    setIsRequesting(true);
    setIsTypingComplete(false);
    setContent('')
    setTimeout(() => {
      scrollToBottom(BubbleListRef.current!);
    }, 100);
  };
  // 点击会话
  const handleCheckSession = useCallback(
    async (event: unknown) => {
      const sessionId = event as string;
      const { data } = await checkSession(sessionId);
      setMessages(formatMessageList(data));
      currentConversationIdRef.current = sessionId;
      setIsTyping(false);
    },
    [setMessages]
  );
  // 点击会话建议
  const handleSuggestionSendMessage = useCallback(
    (event: unknown) => {
      const data = event as { description: string };
      onRequest(data.description);
      
    },
    [onRequest]
  );
  // 监听点击会话
  useEffect(() => {
    eventBus.on('checkSession', handleCheckSession);
    return () => {
      eventBus.off('checkSession', handleCheckSession);
    };
  }, [handleCheckSession]);
  // 监听创建会话
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
  // 获取下一轮会话建议
  const handleGetNextSuggestion = useCallback(async () => {
    setIsTypingComplete(true);
    setIsRequesting(false);
    if (currentMessageIdRef.current) {
      const res = await getNextSuggestion(currentMessageIdRef.current);
      if (res.result === 'success' && res.data && res.data.length > 0) {
        eventBus.emit('getNextSuggestionSuccess', res.data);
      }
    }
  }, []);
  // 监听获取下一轮会话建议
  useEffect(() => {
    eventBus.on('onTypingComplete', handleGetNextSuggestion);
    return () => {
      eventBus.off('onTypingComplete', handleGetNextSuggestion);
    };
  }, [handleGetNextSuggestion]);

  // 滚动到底部
  const handleScrollToBottom = () => {
    const el = BubbleListRef.current?.nativeElement;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  };
  return (
    <>
      <div className="w-full h-full box-border p-[32px_8px]">
        <div className="h-full flex flex-col items-center justify-between relative">
          {messages.length > 0 ? (
            <BubbleList ref={BubbleListRef} messages={messages} isTyping={isTyping} isTypingComplete={isTypingComplete} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full h-full flex justify-center items-center">
              <Prompt />
            </motion.div>
          )}
          <ScrollToBottom
            onScrollToBottomClick={handleScrollToBottom}
            visible={messages.length > 0}
          />

          <div className="w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}>
              <Button type='primary' className="m-[16px_0]" onClick={handleGlobalSearch} icon={<SearchOutlined />}>全局搜索</Button>
              <Sender
                className="w-[896px]! max-w-[896px] min-w-[320px]"
                loading={isRequesting}
                value={content}
                placeholder="随便问点什么"
                onChange={handleChange}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                disabled={!isLogin}
                // actions={false}
                // footer={senderFooter}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
