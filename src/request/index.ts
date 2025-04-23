// 封装 fetch
import Cookies from 'js-cookie';
import LoginModal from '@client/components/Login';
import { notification } from 'antd';
const baseUrl = import.meta.env.VITE_BASE_URL;
const request = async (url: string, options: RequestInit, isJson = true) => {
  const URL = `${baseUrl}${url}`
  const response = await fetch(URL, {
    ...options,
    headers: {
      ...options.headers,
      'Auth': Cookies.get('token') || '',
    },
  });
  if (isJson) {
    const data = await response.json();
    if (data.code === 401) {
      LoginModal.show();
    }  
    // 只提示一次500错误
    if (data.code === 500 && !sessionStorage.getItem('requestError500')) {
      sessionStorage.setItem('requestError500', 'true');
      notification.error({
        message: '服务器异常',
        description: data.message + '，请刷新页面尝试',
        onClose: () => {
          sessionStorage.removeItem('requestError500');
        }
      });
    }
    return data;
  }
  return response;
};

export default request;
