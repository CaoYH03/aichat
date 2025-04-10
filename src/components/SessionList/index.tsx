// 会话列表
import { Conversations } from '@ant-design/x';
import { getChatList } from '@client/api';
import { useEffect, useState, useCallback } from 'react';
import eventBus from '@client/hooks/eventMitt';
import { addSearchParams } from '@client/utils';
import { Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

interface SessionItem {
  key: string;
  label: string;
}

const SessionList = () => {
  const [items, setItems] = useState<SessionItem[]>([]);
  const [activeKey, setActiveKey] = useState('');
  const [style] = useState({
    width: '200px',
    minHeight: '100%',
    padding: '0',
  });
  const [searchParams] = useSearchParams();
  
  const fetchChatList = useCallback(async () => {
    const response = await getChatList();
    setItems(
      response.data.map((item: { id: string; name: string }) => ({
        key: item.id,
        label: item.name,
      }))
    );
  }, []);
  
  useEffect(() => {
    fetchChatList();
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      setActiveKey(conversationId);
    }
  }, [fetchChatList, searchParams]);
  
  useEffect(() => {
    eventBus.on('requestSessionList', fetchChatList);
    return () => {
      eventBus.off('requestSessionList', fetchChatList);
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
    eventBus.emit('createSession');
  };
  
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-[#fff] p-4">
      <div className="mb-4 flex">
        <Button 
          onClick={handleCreateSession}
          type="primary"
          className="w-full bg-[#615ced]! text-[#fff]"
        >
          新建会话
        </Button>
      </div>
      <Conversations
        items={items}
        activeKey={activeKey}
        style={style}
        onActiveChange={handleActiveChange}
      />
    </div>
  );
};

export default SessionList;
