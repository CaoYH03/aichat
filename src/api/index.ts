import request from "@client/request";
const token = 'app-jO8oLjoCURbE2SjOz0dZkn31';
export const chatMessage = async (data: unknown) => {
  return request('/spa/llm/chat-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};
// 终止聊天
export const stopChat = async (task_id: string, data: unknown) => {
  return request(`/spa/llm/chat-messages/${task_id}/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};
// 获取会话列表
export const getChatList = async (params: {
  user: string;
  last_id: string;
  limit: number;
}) => {
  return request(`/spa/llm/conversations?user=${params.user}&last_id=${params.last_id}&limit=${params.limit}`, {
    method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
// 获取会话详情
export const checkSession = async (conversation_id: string) => {
  return request(`/spa/llm/messages?user=abc&conversation_id=${conversation_id}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
// 获取下一轮会话建议
export const getNextSuggestion = async (message_id: string) => {
  return request(`/spa/llm/messages/${message_id}/suggested?user=abc`, {
    method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
// 重命名会话
export const renameSession = async (
  conversation_id: string,
  data: { name: string; auto_generate: boolean; user: string }
) => {
  return request(`/spa/llm/conversations/${conversation_id}/name`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};
// 删除会话
export const deleteSession = async (
  conversation_id: string,
  data: { user: string }
) => {
  return request(`/spa/llm/conversations/${conversation_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};
