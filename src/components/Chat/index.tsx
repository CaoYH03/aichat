import BubbleList from '@client/components/Bubble';
import Prompt from '@client/components/Prompt';
import ScrollToBottom from '@client/components/ScrollToBottom';
import { Sender } from '@ant-design/x';
import { Button, notification, Spin } from 'antd';
import { SearchOutlined, LoadingOutlined, SendOutlined } from '@ant-design/icons';
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
// import { addSearchParams } from '@client/utils';
import { useIsLogin } from '@client/hooks/useIsLogin';
import { useUserStore } from '@client/store/user';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LoginModal from '@client/components/Login';

// 类型定义
interface ChatMessage {
  query: string;
  answer: string;
}

// 工具函数
const formatMessageList = (data: ChatMessage[]): MessageInfo<string>[] => {
  if (!data.length) return [];
  
  return data.flatMap((item: ChatMessage, index: number) => [
    // local message
    {
      id: `msg_local_${index}_${Math.random()}`,
      message: item.query,
      status: 'local' as MessageStatus,
    },
    // ai message
    {
      id: `msg_ai_${index}_${Math.random()}`,
      message: item.answer,
      status: 'ai' as MessageStatus,
    }
  ]);
};

const scrollToBottom = (el: { nativeElement: HTMLDivElement }) => {
  if (!el?.nativeElement) return;
  
  const elDom = el.nativeElement;
  setTimeout(() => {
    elDom.scrollTop = elDom.scrollHeight;
  }, 100);
};

// 聊天页面组件
const Chat = () => {
  // 状态管理
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('conversationId');
  const navigate = useNavigate();
  const [isMessageLoading, setIsMessageLoading] = useState(!!id);
  
  // refs
  const abortRef = useRef<() => void>(() => {});
  const currentTaskIdRef = useRef('');
  const currentConversationIdRef = useRef('');
  const currentMessageIdRef = useRef('');
  const BubbleListRef = useRef<{ nativeElement: HTMLDivElement } | null>(null);
  
  // hooks
  const { userInfo, setUserInfo } = useUserStore();
  const userStoreSelector = useUserStore.getState;
  const [isLogin] = useIsLogin();


  // 请求代理
  const [agent] = useXAgent({
    request: async ({ message }, { onUpdate, onSuccess }) => {
      const currentUserInfo = userStoreSelector().userInfo;
      const controller = new AbortController();
      const signal = controller.signal;
                  // 保存取消函数
                  abortRef.current = () => {
                    controller.abort();
                  };
      const response = await chatMessage({
        inputs: {},
        query: message,
        response_mode: 'streaming',
        conversation_id: currentConversationIdRef.current,
        user: currentUserInfo.userId,
        files: [],
      },signal).catch(error => {
        if (error.name === 'AbortError') {
          handleApiError(408);
        }
      });
      
      // 处理错误响应
      if (handleApiError(response.status)) return;
      if (!response.body) throw new Error('No response body');
      
      // 处理流式响应
      let content = '';
      const stream = XStream({ readableStream: response.body });
      const reader = stream.getReader();
      
      
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
              // 更新任务ID
              if (parsedChunk.task_id !== currentTaskIdRef.current) {
                currentTaskIdRef.current = parsedChunk.task_id;
              }
              
              // 更新会话ID
              if (parsedChunk.conversation_id !== currentConversationIdRef.current) {
                currentConversationIdRef.current = parsedChunk.conversation_id;
                navigate(`/?conversationId=${parsedChunk.conversation_id}`);
              }
              
              // 更新消息ID
              if (parsedChunk.message_id !== currentMessageIdRef.current) {
                currentMessageIdRef.current = parsedChunk.message_id;
              }
              
              // 更新内容
              const newContent = parsedChunk.answer || '';
              content += newContent;
              onUpdate(content);
            }
          } catch (error) {
            console.error('Error parsing chunk:', error);
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  });

  // 数据管理
  const { onRequest, messages, setMessages } = useXChat({ agent });

    // 处理API错误响应
    const handleApiError = useCallback((status: number) => {
      if (status === 401) {
        // 处理401未授权错误
        setUserInfo({
          userId: '',
          level: 0,
          id: '',
          email: '',
          avatar: '',
          position: '',
          user_name: '',
        });
        
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_error_${Math.random()}`,
            message: '请先登录，再进行会话',
            status: 'success' as MessageStatus,
          }
        ]);
        
        LoginModal.show();
        return true;
      } 
      if (status === 408) {
        // 处理408超时错误
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_error_${Math.random()}`,
            message: '已经取消请求',
            status: 'success' as MessageStatus,
          }
        ]);
        
        return true;
      }
      
      if (status !== 200) {
        // 处理其他错误
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_error_${Math.random()}`,
            message: '服务器异常，请稍后再试',
            status: 'success' as MessageStatus,
          }
        ]);
        
        notification.error({
          message: '服务器异常',
          description: (
            <div>
              <p>请检查网络连接或稍后再试</p>
              <a href="javascript:void(0)" onClick={() => window.location.reload()}>
                刷新页面
              </a>
            </div>
          ),
        });
        
        setIsRequesting(false);
        eventBus.emit('onIsTypingComplete', true);
        return true;
      }
      
      return false;
    }, [setMessages, setUserInfo]);

  // 开始聊天
  const startChat = useCallback((content: string) => {
    if (!content.trim()) return;
    
    setIsTyping(true);
    onRequest(content);
    setIsRequesting(true);
    setIsTypingComplete(false);
    eventBus.emit('onIsTypingComplete', false);
  }, [onRequest]);

  // 取消请求
  const handleCancel = useCallback(() => {
    abortRef.current();
    setIsTypingComplete(true);
    eventBus.emit('onIsTypingComplete', true);
    setIsRequesting(false);
    if(currentTaskIdRef.current) {
      stopChat(currentTaskIdRef.current, { user: userInfo.userId });
    }
  }, [userInfo.userId]);

  // 提交消息
  const handleSubmit = useCallback((nextContent: string) => {
    startChat(nextContent);
    setContent('');
    setTimeout(() => {
      if (BubbleListRef.current) {
        scrollToBottom(BubbleListRef.current);
      }
    }, 100);
  }, [startChat]);

  // 输入框内容变化
  const handleChange = useCallback((e: string) => {
    setContent(e);
  }, []);

  // 创建会话
  const handleCreateSession = useCallback(() => {
    setMessages([]);
    // setIsTyping(true);
    currentConversationIdRef.current = '';
    currentMessageIdRef.current = '';
    currentTaskIdRef.current = '';
    navigate('/');
  }, [setMessages, navigate]);

  // 点击会话
  const handleCheckSession = useCallback(async (event: unknown) => {
    setIsMessageLoading(true);
    const sessionId = event as string;
    currentConversationIdRef.current = sessionId;
    setSearchParams({ conversationId: sessionId });
    try {
      const { data } = await checkSession(sessionId, userInfo.userId);
      
      if (data?.length > 0) {
        setMessages(formatMessageList(data));
        setIsTyping(false);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      notification.error({ message: '获取会话失败' });
    } finally {
      setIsMessageLoading(false);
    }
  }, [setMessages, userInfo.userId, setSearchParams]);

  // 点击会话建议
  const handleSuggestionSendMessage = useCallback((event: unknown) => {
    const data = event as { description: string };
    startChat(data.description);
  }, [startChat]);

  // 获取下一轮会话建议
  const handleGetNextSuggestion = useCallback(async () => {
    setIsTypingComplete(true);
    eventBus.emit('onIsTypingComplete', true);
    setIsRequesting(false);
    
    if (!isLogin || !currentMessageIdRef.current) return;
    
    try {
      const res = await getNextSuggestion(currentMessageIdRef.current, userInfo.userId);
      
      if (res.result === 'success' && res.data?.length > 0) {
        eventBus.emit('getNextSuggestionSuccess', res.data);
      }
    } catch (error) {
      console.error('Failed to get next suggestion:', error);
    }
  }, [userInfo.userId, isLogin]);

  // 全局搜索
  const handleGlobalSearch = useCallback(() => {
    eventBus.emit('globalSearch');
  }, []);

  // 滚动到底部
  const handleScrollToBottom = useCallback(() => {
    const el = BubbleListRef.current?.nativeElement;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  // 聊天内容渲染
  const chatContent = useMemo(() => {
    // if (isMessageLoading) {
    if (true) {
      return <Spin indicator={<LoadingOutlined spin />} size="large" style={{ top: '20%' }} />;
    }
    
    if (messages.length > 0) {
      return (
        <BubbleList 
          ref={BubbleListRef} 
          messages={messages} 
          isTyping={isTyping} 
          isTypingComplete={isTypingComplete} 
        />
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="w-full h-full flex justify-center items-center"
      >
        <Prompt handleClickRecommendItem={startChat} />
      </motion.div>
    );
  }, [messages, isTyping, isTypingComplete, isMessageLoading, startChat]);

  // 初始化会话
  useEffect(() => {
    const initSession = async () => {
      if (!isLogin) {
        setIsMessageLoading(false);
        return;
      }
      
      if (!id) {
        setIsMessageLoading(false);
        setMessages([]);
        return;
      }
      
      try {
        currentConversationIdRef.current = id;
        const { data } = await checkSession(currentConversationIdRef.current, userInfo.userId);
        
        if (data?.length > 0) {
          setMessages(formatMessageList(data));
          setIsTyping(false);
        } else {
          handleCreateSession();
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
        notification.error({ message: '初始化会话失败' });
      } finally {
        setIsMessageLoading(false);
      }
    };
    
    initSession();
  }, [isLogin, userInfo.userId, handleCreateSession, setMessages]);

  // 事件监听
  useEffect(() => {
    // 会话事件监听
    eventBus.on('checkSession', handleCheckSession);
    eventBus.on('createSession', handleCreateSession);
    eventBus.on('suggestionSendMessage', handleSuggestionSendMessage);
    eventBus.on('onTypingComplete', handleGetNextSuggestion);
    
    return () => {
      eventBus.off('checkSession', handleCheckSession);
      eventBus.off('createSession', handleCreateSession);
      eventBus.off('suggestionSendMessage', handleSuggestionSendMessage);
      eventBus.off('onTypingComplete', handleGetNextSuggestion);
    };
  }, [handleCheckSession, handleCreateSession, handleSuggestionSendMessage, handleGetNextSuggestion]);

  return (
    <div className="w-full h-full box-border p-[32px_8px_8px] flex-1">
      <div className="h-full flex flex-col items-center justify-between relative">
        {chatContent}
        
        <ScrollToBottom
          onScrollToBottomClick={handleScrollToBottom}
          visible={messages.length > 0}
        />

        <div className="w-full flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              width: 'calc(100% - 78px)',
              position: 'relative',
              left: '22px',
              marginBottom: '10px',
            }}
          >
            <Button 
              className="m-[10px_0]" 
              onClick={handleGlobalSearch} 
              icon={<SearchOutlined />}
            >
              搜索数据
            </Button>
            <Sender
              className="w-full"
              loading={isRequesting}
              value={content}
              placeholder="请输入您想查询的信息"
              onChange={handleChange}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
              disabled={!isLogin}
              actions={(_, info)=>{
                const { LoadingButton, SendButton } = info.components;
                if(isRequesting) {
                  return <LoadingButton />
                }
                return <SendButton icon={<SendOutlined style={{ position: 'relative', left: '1px', top: '-1px', color: '#fff', transform: 'rotate(-35deg)' }} />} />
              }}
            />
          </motion.div>
          <span className='text-[10px] text-[#8f91a8] text-center'>服务生成的所有内容均由人工智能模型生成，其生成内容的准确性和完整性无法保证，不代表我们的态度或观点</span>
        </div>
      </div>
    </div>
  );
};

export default Chat;