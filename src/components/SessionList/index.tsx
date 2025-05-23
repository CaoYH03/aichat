// 会话列表
import { Conversations, type ConversationsProps } from '@ant-design/x';
import {
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import { getChatList, renameSession, deleteSession } from '@client/api';
import { useEffect, useState, useCallback, useRef } from 'react';
import eventBus from '@client/hooks/eventMitt';
import { compareDate } from '@client/utils';
import { GetProp, message, Button, Input, Divider, Space } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsLogin } from '@client/hooks/useIsLogin';
import LoginModal from '@client/components/Login';
import styles from './index.module.less';
import { useUserStore } from '@client/store/user';
import { useNavigate } from 'react-router-dom';

interface SessionItem {
  key: string;
  label: string | React.ReactNode;
}

const SessionList = ({ isFold }: { isFold: boolean }) => {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const [items, setItems] = useState<SessionItem[]>([]);
  const [isTypingComplete, setIsTypingComplete] = useState(true);
  const [activeKey, setActiveKey] = useState('');
  // 添加一个新的状态存储编辑中的会话
  const editingSession = useRef({ index: -1, value: '' });
  const [isCreateNewSession, setIsCreateNewSession] = useState(false);
  const [style] = useState({
    width: '230px',
    minHeight: '100%',
    padding: '0',
    overflow: 'hidden',
  });
  const [hasMore, setHasMore] = useState(true);
  const [isLogin] = useIsLogin();

  const menuConfig: ConversationsProps['menu'] = (conversation) => ({
    items: [
      {
        label: '重命名',
        key: 'rename',
        icon: <EditOutlined />,
      },
      {
        label: '删除',
        key: 'delete',
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
    onClick: (menuInfo) => {
      menuInfo.domEvent.stopPropagation();
      const selectedConversationIndex = items.findIndex(
        (item) => item.key === conversation.key
      );
      let originalLabel = '';
      switch (menuInfo.key) {
        case 'rename':
          if (typeof items[selectedConversationIndex].label === 'string') {
            originalLabel = items[selectedConversationIndex].label;
            editingSession.current = {
              index: selectedConversationIndex,
              value: originalLabel,
            };
          }
          // 将selectedConversationIndex 的label 调整成 input 输入框
          setItems(
            items.map((item, index) => {
              if (index === selectedConversationIndex) {
                return {
                  ...item,
                  label: (
                    <div className="flex items-center gap-2">
                      <Input
                        defaultValue={''}
                        onChange={(e) =>
                          (editingSession.current = {
                            ...editingSession.current,
                            value: e.target.value,
                          })
                        }
                      />
                      <CloseOutlined onClick={() => handleCloseRename(index)} />
                      <CheckOutlined onClick={() => handleCheckRename(index)} />
                    </div>
                  ),
                };
              }
              return item;
            })
          );
          break;
        case 'delete':
          handleDeleteSession(conversation.key);
          break;
        default:
          break;
      }
    },
  });
  const groupable: GetProp<typeof Conversations, 'groupable'> = {
    title: (group, { components: { GroupTitle } }) => {
      return (
        <GroupTitle>
          <Space>
            <CommentOutlined />
            <span style={{ color: '#878aab' }}>{group}</span>
          </Space>
        </GroupTitle>
      );
    },
  };
  const [searchParams] = useSearchParams();

  const fetchChatList = useCallback(async (isSelect = false, lastId = '') => {
    const response = await getChatList({
      user: userInfo.userId,
      last_id: lastId,
      limit: 20,
    });
    if(response.code === 401) return;
    if(!response.data) {
      console.log('没有更多了');
      setHasMore(false);
      return;
    };
    setHasMore(response.hasMore || response.has_more);
    if (lastId) {
      setItems((prev) => [
        ...prev,
        ...response.data.map(
          (item: { id: string; name: string; updatedAt: number; updated_at?: number }) => ({
            key: item.id,
            label: item.name,
            timestamp: +(`${item.updatedAt || item.updated_at}`+ '000'),
            // 今天，和最近七天 和 更早
            group: compareDate((+(`${item.updatedAt || item.updated_at}`+ '000')), new Date().getTime()),
          })
        ),
      ]);
    } else {
      setItems(
        response.data.map((item: { id: string; name: string; updatedAt: number; updated_at?: number }) => ({
          key: item.id,
          label: item.name,
          timestamp: +(`${item.updatedAt || item.updated_at}`+ '000'),
          // 今天，和最近七天 和 更早
          // group: compareDate((+(`${item.updated_at}`+ '000')), new Date().getTime()),
          group: compareDate((+(`${item.updatedAt || item.updated_at}`+ '000')), new Date().getTime()),
        }))
      );
      if (isSelect) {
        setActiveKey(response.data[0].id);
      }
      setIsCreateNewSession(false);
    }
  }, [userInfo]);
  const fetchMore = useCallback(() => {
    fetchChatList(false, items[items.length - 1].key);
  }, [items, fetchChatList]);
// 获取会话列表
  useEffect(() => {
    if (!isLogin) {
      return;
    }
    fetchChatList();
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      setActiveKey(conversationId);
    }
  }, [fetchChatList, searchParams, isLogin]);

  useEffect(() => {
    const handleRequestSessionList = (event: unknown) => {
      const isSelect = event as boolean;
      fetchChatList(isSelect);
    };

    eventBus.on('requestSessionList', handleRequestSessionList);
    return () => {
      eventBus.off('requestSessionList', handleRequestSessionList);
    };
  }, [fetchChatList]);
  useEffect(() => {
    eventBus.on('onIsTypingComplete', (event: unknown) => {
      setIsTypingComplete(event as boolean);
    });
    return () => {
      eventBus.off('onIsTypingComplete');
    };
  }, []);

  // 如果容器没有滚动条但还有更多数据，主动加载更多
  useEffect(() => {
    const scrollDiv = document.getElementById('scrollableDiv');
    if (scrollDiv && items.length > 0 && hasMore) {
      // 如果容器没有滚动条但还有更多数据，主动加载更多
      if (scrollDiv.scrollHeight <= scrollDiv.clientHeight) {
        fetchMore();
      }
    }
  }, [items, hasMore]);

  const handleActiveChange = (key: string) => {
    setActiveKey(key);
    setIsCreateNewSession(false);
    if (key !== activeKey) {
      navigate(`/?conversationId=${key}`);
      eventBus.emit('checkSession', key);
    }
  };
  const handleCreateSession = () => {
    if (!isLogin) {
      LoginModal.show();
      return;
    }
    if (isCreateNewSession) {
      message.success('已是最新会话');
      // setActiveKey('');
      return;
    }
    setIsCreateNewSession(true);
    setActiveKey('');
    // setItems((prev) => [{ key: '', label: '新建会话' }, ...prev]);
    eventBus.emit('createSession');
  };

  const handleCloseRename = (idx: number) => {
    setItems(
      items.map((item, index) => {
        if (index === idx) {
          return { ...item, label: item.label };
        }
        return item;
      })
    );
  };

  const handleCheckRename = async (index: number) => {
    if (editingSession.current.index === index) {
      const data = await renameSession(items[index].key, {
        name: editingSession.current.value,
        auto_generate: false,
        user: userInfo.userId,
      });
      if (data.status === 'normal') {
        setItems(
          items.map((item, idx) => {
            if (idx === index) {
              return { ...item, label: editingSession.current.value };
            }
            return item;
          })
        );
        message.success('重命名成功');
      } else {
        message.error('重命名失败');
      }
    }
  };
  const handleDeleteSession = async (key: string) => {
    const data = await deleteSession(key, { user: userInfo.userId });
    if (data.code === 200) {
      setItems(items.filter((item) => item.key !== key));
      message.success('删除成功');
      if (activeKey === key) {
        setActiveKey('');
      }
    } else {
      message.error('删除失败');
    }
  };
  return (
    <motion.div
      className={styles.sessionListContainer}
      id="scrollableDiv"
      initial={{ width: 260, opacity: 1 }}
      animate={{
        width: isFold ? 0 : 260,
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      style={{
        flexShrink: 0,
        willChange: 'width',
        overflowY: !isTypingComplete ? 'hidden' : 'auto',
        height: '100%',
        overflowX: 'hidden',
        transform: 'translateZ(0)',
        borderRadius: '12px 0 0 12px',
        backgroundColor: '#fff',
      }}>
        {
          isLogin ? (
            <InfiniteScroll
            dataLength={items.length}
            next={fetchMore}
            hasMore={hasMore}
            loader={
              <></>
            }
    
            endMessage={
              items.length > 0 &&(<Divider plain style={{ color: '#ccc' }}>
              没有更多了
            </Divider>)
            }
            scrollableTarget="scrollableDiv">
            <div className="bg-[#fff] p-[16px_16px_0_16px]">
              <div className="mb-4 flex">
                <Button
                  disabled={!isLogin}
                  onClick={handleCreateSession}
                  type="primary"
                  className="w-full text-[#fff]">
                  新建会话
                </Button>
              </div>
              <Conversations
                items={items}
                activeKey={activeKey}
                style={style}
                onActiveChange={handleActiveChange}
                menu={menuConfig}
                groupable={groupable  }
                className={`${styles.sessionList} ${!isTypingComplete ? styles.conversationListDisabled : ''}`}
              />
            </div>
          </InfiniteScroll>
          ) : (
            <div className='h-full p-[16px_16px_0_16px] flex flex-col items-center justify-center gap-[10px]'>
              <h2 className='text-[18px] font-bold text-[#333]'>   登录开启体验
              </h2>
              <h3 className='text-[14px] text-[#666] text-center'> 行业洞察、企业扫描、一键生成简报等多个场景</h3>
              <Button type='primary' onClick={() => LoginModal.show()}>立即登录</Button>
            </div>
          )
          
        }
    </motion.div>
  );
};

export default SessionList;
