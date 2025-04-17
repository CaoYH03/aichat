// 首页
import IndexContent from '@client/components/layout/IndexContent';
import SideBar from '@client/components/layout/SideBar';
import { Flex } from 'antd';
import { useEffect, useCallback, Suspense } from 'react';
import { getUserInfo } from '@client/api/login';
import './index.less';
import { useUserStore } from '@client/store/user';
const Index = () => {
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const initUserInfo = useCallback(async () => {
    const res = await getUserInfo();
    if (res.code === 200 && res.data) {
      setUserInfo(res.data);
    }
  }, [setUserInfo]);
  useEffect(() => {
    initUserInfo();
  }, [initUserInfo]);
  return (
    // 左右布局 侧边栏和聊天窗口 1:3
    // 使用延时组件 延迟3秒后 显示侧边栏和聊天窗口
    <Suspense fallback={<div>Loading...</div>}>
      <div className="layout-container">
        <Flex>
          <SideBar />
          <IndexContent />
        </Flex>
      </div>
    </Suspense>
  );
};

export default Index;
