// 用户信息
import { create } from 'zustand';

interface UserInfo {
  id: string;
  email: string;
  avatar: string;
  position: string;
  user_name: string;
  userId: string;
  level: number;
}

interface UserStore {
  userInfo: UserInfo | { userId: string, level: number };
  setUserInfo: (userInfo: UserInfo) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userInfo: {
    userId: '',
    level: 0
  },
  setUserInfo: (userInfo: UserInfo) => {
    set({ userInfo });
  },
}));