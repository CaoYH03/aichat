// 判断是否登录
import { useMemo } from 'react';


export const useIsLogin = () => {
  const userInfo = localStorage.getItem('userInfo');
  return useMemo(() => {
    return [!!userInfo];
  }, [userInfo]);
};
