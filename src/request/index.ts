// 封装 fetch
import Cookies from 'js-cookie';
import LoginModal from '@client/components/Login';
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
    return data;
  }
  return response;
};

export default request;
