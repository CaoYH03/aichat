import request from "@client/request";
import Cookies from "js-cookie";
interface BriefingCreateParams {
  title: string;
  content: string;
  token?: string;
  settings?: {
    companyColumn: string[];
    intelligenceColumn: string[];
    intelligenceTemplate: number;
  };
  subjectType?: number;
  briefNewsRelation?: string[];
}
export const chatMessage = async (data: unknown, signal?: AbortSignal) => {
  return request('/spa/llm/chat-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal
  }, false);
};
// 终止聊天
export const stopChat = async (task_id: string, data: unknown) => {
  return request(`/spa/llm/chat-messages/${task_id}/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
      },
    }
  );
};
// 获取会话详情
export const checkSession = async (conversation_id: string, user: string) => {
  return request(`/spa/llm/messages?user=${user}&conversation_id=${conversation_id}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
// 获取下一轮会话建议
export const getNextSuggestion = async (message_id: string, user: string) => {
  return request(`/spa/llm/messages/${message_id}/suggested?user=${user}`, {
    method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    },
    body: JSON.stringify(data),
  });
};
// 插入简报
export const insertBrief = async (data: BriefingCreateParams) => {
  return request(`/spa/briefing/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      settings: {
        companyColumn: [
          "一句话简介",
          "企业介绍",
          "投资方",
          "估值情况",
          "最新融资",
          "最新专利",
          "最新招投标"
        ],
        intelligenceColumn: [
          "情报标题",
          "情报摘要",
          "发布时间",
          "情报新闻源",
          "情报类型",
          "情报关联行业",
          "情报关联主体"
        ],
        intelligenceTemplate: 0,
      },
      subjectType: 1,
      briefNewsRelation: [],
      token: Cookies.get("token") || "",
    }),
  });
};
// 推荐简报
export const getRecommendBrief = async (page: number = 1, pageSize: number = 3) => {
  return request(`/spa/recommend/brief_follow?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
