export const chatMessage = async (data: unknown) => {
  const response = await fetch('/api/chat-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer app-FmtSXSraSCIwrsYEwiIirtgD',
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
      Authorization: 'Bearer app-FmtSXSraSCIwrsYEwiIirtgD',
    },
    body: JSON.stringify(data),
    });
    return response.json();
};
// 获取会话列表
export const getChatList = async () => {
  const response = await fetch('/api/conversations?user=abc-123', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer app-FmtSXSraSCIwrsYEwiIirtgD',
    },
  });
  return response.json();
};
// 获取会话详情
export const checkSession = async (conversation_id: string) => {
  const response = await fetch(`/api/messages?user=abc-123&conversation_id=${conversation_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer app-FmtSXSraSCIwrsYEwiIirtgD',
    },
  });
  return response.json();
};
// 获取下一轮会话建议
export const getNextSuggestion = async (message_id: string) => {
  const response = await fetch(`/api/messages/${message_id}/suggested?user=abc-123`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer app-FmtSXSraSCIwrsYEwiIirtgD',
    },
  });
  return response.json();
};
