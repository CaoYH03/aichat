// 封装 fetch
import Cookies from 'js-cookie';
const request = async (url: string, options: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Auth': Cookies.get('token') || '',
    },
  });
  return response.json();
};

export default request;
