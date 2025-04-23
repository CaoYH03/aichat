import BubbleList from '@client/components/Bubble';
import Prompt from '@client/components/Prompt';
import ScrollToBottom from '@client/components/ScrollToBottom';
import { Sender } from '@ant-design/x';
import { Button, notification, Spin } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
import { useUserStore } from '@client/store/user';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LoginModal from '@client/components/Login';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('conversationId');
  const [isMessageLoading, setIsMessageLoading] = useState(id ? true : false);
  const abortRef = useRef(() => {});
  const currentTaskIdRef = useRef('');
  const currentConversationIdRef = useRef('');
  const currentMessageIdRef = useRef('');
  const BubbleListRef = useRef<HTMLDivElement | null>(null);
  const { userInfo } = useUserStore();
  const [isLogin] = useIsLogin();
  // 请求代理
  const [agent] = useXAgent({
    request: async ({ message }, { onUpdate, onSuccess }) => {
      const response = await chatMessage({
        inputs: {},
        query: message,
        response_mode: 'streaming',
        conversation_id: currentConversationIdRef.current,
        user: userInfo.userId,
        files: [],
      });
      if (response.status === 401) {
        setMessages((prev ) => [...prev, {
          id: `msg_${Math.random().toString()}`,
          message: '登录过期，请重新登录',
          status: 'success' as MessageStatus,
        }]);
        LoginModal.show();
        return;
      }
      if (response.status !== 200) {
        setMessages((prev ) => [...prev, {
          id: `msg_${Math.random().toString()}`,
          message: '服务器异常，请稍后再试',
          status: 'success' as MessageStatus,
        }]);
        notification.error({
          message: '服务器异常',
          description: (
            <div>
              <p>请检查网络连接或稍后再试</p>
              <a href="javascript:void(0)" onClick={() => {
                window.location.reload();
              }}>刷新页面</a>
            </div>
          ),
        });
        setIsRequesting(false);
        eventBus.emit('onIsTypingComplete', true);
        return;
      }
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
  const startChat = useCallback((content: string) => {
    setIsTyping(true);
    onRequest(content);
    setIsRequesting(true);
    setIsTypingComplete(false);
    eventBus.emit('onIsTypingComplete', false);
  }, [onRequest, setIsTyping, setIsRequesting, setIsTypingComplete]);
  const chatContent = useMemo(() => {
    if(isMessageLoading) {
      return <Spin indicator={<LoadingOutlined spin  />} size="large" style={{ top: '20%', }} />
    }
    if(messages.length > 0) {
      return (
        <BubbleList ref={BubbleListRef} messages={messages} isTyping={isTyping} isTypingComplete={isTypingComplete} />
      );
    }
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="w-full h-full flex justify-center items-center">
        <Prompt handleClickRecommendItem={startChat} />
      </motion.div>
    )
  }, [startChat, isMessageLoading, messages, isTyping, isTypingComplete]);
  const handleGlobalSearch = () => {
    eventBus.emit('globalSearch');
  }
    // 创建会话
    const handleCreateSession = useCallback(async () => {
      setMessages([]);
      setIsTyping(true);
      currentConversationIdRef.current = '';
      navigate('/');
    }, [setMessages, navigate]);
  // 初始化请求会话
  useEffect(() => {
    const initSession = async () => {
      if (!isLogin) {
        sessionStorage.setItem('preConversationId', id || '');
        setIsMessageLoading(false);
        return;
      }
      if(!id) return;
        currentConversationIdRef.current = id;
        const { data } = await checkSession(id, userInfo.userId);
        if (data && data.length > 0) {
          setMessages(formatMessageList(data));
          setIsTyping(false);
        } else {
          handleCreateSession();
        }
      setIsMessageLoading(false);
    };
    initSession();
  }, [setMessages, isLogin, handleCreateSession, userInfo.userId, id]);
  // 输入框内容变化
  const handleChange = useCallback((e: string) => {
    setContent(e);
  }, []);
  // 点击取消
  const handleCancel = () => {
    abortRef.current();
    stopChat(currentTaskIdRef.current, {
      user: userInfo.userId,
    });
  };
  // 点击发送
  const handleSubmit = (nextContent: string) => {
    startChat(nextContent)
    setContent('')
    setTimeout(() => {
      scrollToBottom(BubbleListRef.current!);
    }, 100);
  };
  // 点击会话
  const handleCheckSession = useCallback(
    async (event: unknown) => {
      setIsMessageLoading(true);
      const sessionId = event as string;
      const { data } = await checkSession(sessionId, userInfo.userId);
      if(data && data.length > 0) {
        setMessages(formatMessageList(data));
        currentConversationIdRef.current = sessionId;
        setIsTyping(false);
      } else {
        setMessages([]);
      }
      setIsMessageLoading(false);
    },
    [setMessages, userInfo.userId]
  );
  // 点击会话建议
  const handleSuggestionSendMessage = useCallback(
    (event: unknown) => {
      const data = event as { description: string };
      startChat(data.description)
      
    },
    [startChat]
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
    eventBus.emit('onIsTypingComplete', true);
    setIsRequesting(false);
    if(!isLogin) {
      return;
    }
    if (currentMessageIdRef.current) {
      const res = await getNextSuggestion(currentMessageIdRef.current, userInfo.userId);
      if (res.result === 'success' && res.data && res.data.length > 0) {
        eventBus.emit('getNextSuggestionSuccess', res.data);
      }
    }
  }, [userInfo.userId, isLogin]);
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
          {chatContent}
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
              <Button className="m-[10px_0]" onClick={handleGlobalSearch} icon={<SearchOutlined />}>精确搜索</Button>
              <Sender
                className="w-[896px]! max-w-[896px] min-w-[320px]"
                loading={isRequesting}
                value={content}
                placeholder="随便问点什么"
                onChange={handleChange}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                disabled={!isLogin}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
