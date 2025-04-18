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
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userInfo: null,
  setUserInfo: (userInfo: UserInfo) => set({ userInfo }),
}));