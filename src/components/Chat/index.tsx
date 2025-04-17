import BubbleList from '@client/components/Bubble';
import Prompt from '@client/components/Prompt';
import ScrollToBottom from '@client/components/ScrollToBottom';
import { Sender } from '@ant-design/x';
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
import { throttle } from 'lodash';
import { useEffectOnFirstChange } from '@client/hooks/useEffectOnFirstChange';

interface ChatMessage {
  query: string;
  agentThoughts: Array<{ thought: string; observation: string; tool: string }>;
  agent_thoughts: Array<{ thought: string }>;
  answer: string;
}

// 聊天页面
const Chat = () => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const abortRef = useRef(() => {});
  const currentTaskIdRef = useRef('');
  const currentConversationIdRef = useRef('');
  const currentMessageIdRef = useRef('');
  const BubbleListRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTop = useRef(0);
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
  // 初始化请求会话
  useEffect(() => {
    const initSession = async () => {
      const url = new URL(window.location.href);
      const id = url.searchParams.get('conversationId');
      if (id) {
        currentConversationIdRef.current = id;
        const { data } = await checkSession(id);
        if (data && data.length > 0) {
          // setMessageList(formatMessageList(data));
          setMessages(formatMessageList(data));
          setIsTyping(false);
        } else {
          addSearchParams('conversationId', '');
          currentConversationIdRef.current = '';
        }
      }
    };
    initSession();
  }, [setMessages]);
  const handleChange = useCallback((e: string) => {
    setContent(e);
  }, []);
  const scrollToBottom = () => {
    if (BubbleListRef.current) {
      BubbleListRef.current.scrollTop =
        BubbleListRef.current.scrollHeight - BubbleListRef.current.clientHeight;
    }
  };
  const handleCancel = () => {
    abortRef.current();
    stopChat(currentTaskIdRef.current, {
      user: 'abc',
    });
  };
  const handleSubmit = (nextContent: string) => {
    setIsTyping(true);
    onRequest(nextContent);
    setIsRequesting(true);
    setContent('');
    timerRef.current = setInterval(scrollToBottom, 1000);
  };
  // 检查会话
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
  // 创建会话
  const handleCreateSession = useCallback(async () => {
    setIsScrollToBottom(true);
    setMessages([]);
    setIsTyping(true);
    currentConversationIdRef.current = '';
    // 清空 URL 中的 conversationId 参数
    const url = new URL(window.location.href);
    url.searchParams.delete('conversationId');
    window.history.replaceState({}, '', url.toString());
  }, [setMessages]);
  // 处理会话建议
  const handleSuggestionSendMessage = useCallback(
    (data: { description: string }) => {
      onRequest(data.description);
      timerRef.current = setInterval(scrollToBottom, 10000);
    },
    [onRequest]
  );
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
            // message: (item.agentThoughts || item.agent_thoughts)
            //   .map(
            //     (t: { thought: string; observation: string; tool: string }) =>
            //       t.thought
            //      +
            //       `<span class="agent-observation">${
            //         JSON.parse(t.observation || JSON.stringify({}))[t.tool] ||
            //         ''
            //       }</span>`
            //   )
            //   .join(''),
            message: item.answer,
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
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  }, []);
  useEffect(() => {
    eventBus.on('onTypingComplete', handleGetNextSuggestion);
    return () => {
      eventBus.off('onTypingComplete', handleGetNextSuggestion);
    };
  }, [handleGetNextSuggestion]);
  useEffect(() => {
    eventBus.on('cancelScroll', () => {
      setIsRequesting(false);
      if (timerRef.current) {
        console.log('clearInterval----1', timerRef.current);
        clearInterval(timerRef.current);
      }
    });
    return () => {
      eventBus.off('cancelScroll', () => {
        setIsRequesting(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      });
    };
  }, []);
  useEffectOnFirstChange(() => {
    const handleBubbleListScroll = () => {
      const el = BubbleListRef.current;

      if (el) {
        el.addEventListener('scroll', throttle(handleScroll, 300));

        // 清理函数
        return () => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          el.removeEventListener('scroll', throttle(handleScroll, 300));
        };
      }
    };
    handleBubbleListScroll();
  }, [messages, setMessages]);
  const handleScrollToBottom = () => {
    if (BubbleListRef.current) {
      BubbleListRef.current.scrollTo({
        top: BubbleListRef.current.scrollHeight,
        behavior: 'smooth',
      });
      if (agent.isRequesting()) {
        timerRef.current = setInterval(scrollToBottom, 1000);
      }
    }
  };
  const handleScroll = () => {
    const el = BubbleListRef.current;
    if (!el) {
      return;
    }

    const currentScrollTop = el?.scrollTop;
    setIsScrollToBottom(
      el?.scrollHeight - (currentScrollTop + el?.clientHeight) <= 0.5
    );
    console.log(el?.scrollHeight, currentScrollTop, el?.clientHeight);
    console.log(el?.scrollHeight - (currentScrollTop + el?.clientHeight));
    // 向上滚动
    if (currentScrollTop < lastScrollTop.current) {
      if (timerRef.current) {
        console.log('clearInterval----2', timerRef.current);
        clearInterval(timerRef.current);
      }
    }
    lastScrollTop.current = currentScrollTop;
  };
  return (
    <>
      <div className="w-full h-full box-border p-[32px_8px]">
        <div className="h-full flex flex-col items-center justify-between relative">
          {messages.length > 0 ? (
            <div
              ref={BubbleListRef}
              className="w-full h-full flex-1 overflow-scroll pb-[32px]">
              <BubbleList messages={messages} isTyping={isTyping} />
            </div>
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
            visible={!isScrollToBottom}
          />

          <div className="w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}>
              <Sender
                className="w-[896px]! max-w-[896px] min-w-[320px]"
                loading={isRequesting}
                value={content}
                placeholder="随便问点什么"
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
