// 判断是否登录
import { useMemo } from 'react';
import { useUserStore } from '@client/store/user';


export const useIsLogin = () => {
  const userInfo = useUserStore((state) => state.userInfo);
  return useMemo(() => {
    return [!!userInfo?.userId];
  }, [userInfo]);
};
