const token = 'app-jO8oLjoCURbE2SjOz0dZkn31';
export const chatMessage = async (data: unknown) => {
  const response = await fetch('/api/chat-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
};
// 终止聊天
export const stopChat = async (task_id: string, data: unknown) => {
  const response = await fetch(`/api/chat-messages/${task_id}/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
// 获取会话列表
export const getChatList = async (params: {
  user: string;
  last_id: string;
  limit: number;
}) => {
  const response = await fetch(
    `/api/conversations?user=${params.user}&last_id=${params.last_id}&limit=${params.limit}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
};
// 获取会话详情
export const checkSession = async (conversation_id: string) => {
  const response = await fetch(
    `/api/messages?user=abc&conversation_id=${conversation_id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
};
// 获取下一轮会话建议
export const getNextSuggestion = async (message_id: string) => {
  const response = await fetch(
    `/api/messages/${message_id}/suggested?user=abc`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
};
// 重命名会话
export const renameSession = async (
  conversation_id: string,
  data: { name: string; auto_generate: boolean; user: string }
) => {
  const response = await fetch(`/api/conversations/${conversation_id}/name`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
// 删除会话
export const deleteSession = async (
  conversation_id: string,
  data: { user: string }
) => {
  const response = await fetch(`/api/conversations/${conversation_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
