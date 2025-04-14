// 会话列表
import { Conversations, type ConversationsProps } from '@ant-design/x';
import {
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { getChatList, renameSession, deleteSession } from '@client/api';
import { useEffect, useState, useCallback, useRef } from 'react';
import eventBus from '@client/hooks/eventMitt';
import { addSearchParams } from '@client/utils';
import { message, Button, Input, Spin, Divider } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
interface SessionItem {
  key: string;
  label: string | React.ReactNode;
}

const SessionList = ({ isFold }: { isFold: boolean }) => {
  const [items, setItems] = useState<SessionItem[]>([]);
  const [activeKey, setActiveKey] = useState('');
  // 添加一个新的状态存储编辑中的会话
  const editingSession = useRef({ index: -1, value: '' });
  const [isCreateNewSession, setIsCreateNewSession] = useState(false);
  const [style] = useState({
    width: '200px',
    minHeight: '100%',
    padding: '0',
  });
  const [hasMore, setHasMore] = useState(true);

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
  const [searchParams] = useSearchParams();

  const fetchChatList = useCallback(
    async (isSelect = false, lastId = '') => {
      const response = await getChatList({
        user: 'abc',
        last_id: lastId,
        limit: 20,
    });
    setHasMore(response.has_more);
    if (lastId) {
      setItems((prev) => [
        ...prev,
        ...response.data.map((item: { id: string; name: string }) => ({
          key: item.id,
          label: item.name,
        })),
      ]);
    } else {
      setItems(
        response.data.map((item: { id: string; name: string }) => ({
          key: item.id,
          label: item.name,
        }))
      );
      if (isSelect) {
        setActiveKey(response.data[0].id);
      }
      setIsCreateNewSession(false);
    }
  }, []);

  useEffect(() => {
    fetchChatList();
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      setActiveKey(conversationId);
    }
  }, [fetchChatList, searchParams]);

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

  const handleActiveChange = (key: string) => {
    setActiveKey(key);
    if (key !== activeKey) {
      addSearchParams('conversationId', key);
      eventBus.emit('checkSession', key);
    }
  };
  const handleCreateSession = () => {
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
        user: 'abc',
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
    const data = await deleteSession(key, { user: 'abc' });
    if (data.result === 'success') {
      setItems(items.filter((item) => item.key !== key));
      message.success('删除成功');
      if (activeKey === key) {
        setActiveKey('');
      }
    } else {
      message.error('删除失败');
    }
  };
  const fetchMore = () => {
    fetchChatList(false, items[items.length - 1].key);
  };
  return (
    <motion.div
      id="scrollableDiv"
      initial={{ width: 300, opacity: 1 }}
      animate={{
        width: isFold ? 0 : 300,
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      style={{
        willChange: 'width',
        // overflow: 'hidden',
        overflowY: 'auto',
        height: '100%',
        transform: 'translateZ(0)',
        borderRadius: '12px 0 0 12px',
        backgroundColor: '#fff',
      }}>
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center items-center pb-[16px]">
            <Spin />
          </div>
        }
        className="h-[300px] overflow-x-hidden overflow-y-auto"
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
        style={{ overflow: 'hidden' }}>
        <div className="bg-[#fff] p-[16px_16px_0_16px]">
          <div className="mb-4 flex">
            <Button
              onClick={handleCreateSession}
              type="primary"
              className="w-full bg-[#615ced]! text-[#fff]">
              新建会话
            </Button>
          </div>
          <Conversations
            items={items}
            activeKey={activeKey}
            style={style}
            onActiveChange={handleActiveChange}
            menu={menuConfig}
          />
        </div>
      </InfiniteScroll>
    </motion.div>
  );
};

export default SessionList;
