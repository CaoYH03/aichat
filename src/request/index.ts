// 封装 fetch
import Cookies from 'js-cookie';
const baseUrl = import.meta.env.VITE_BASE_URL;
const request = async (url: string, options: RequestInit) => {
  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      'Auth': Cookies.get('token') || '',
    },
  });
  return response.json();
};

export default request;
