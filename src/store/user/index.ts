// 用户信息
import { create } from 'zustand';

interface UserInfo {
  id: string;
  email: string;
  avatar: string;
  position: string;
  user_name: string;
  userId: string;
}

interface UserStore {
  userInfo: UserInfo | { userId: string };
  setUserInfo: (userInfo: UserInfo) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userInfo: {
    userId: '',
  },
  setUserInfo: (userInfo: UserInfo) => {
    set({ userInfo });
  },
}));