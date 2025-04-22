// 首页
import IndexContent from '@client/components/layout/IndexContent';
import SideBar from '@client/components/layout/SideBar';
import { Flex, Spin } from 'antd';
import { useEffect, useCallback, useState } from 'react';
import { getUserInfo } from '@client/api/login';
import { useUserStore } from '@client/store/user';
import styles from './index.module.less';
const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const initUserInfo = useCallback(async () => {
    const res = await getUserInfo();
    if (res.code === 200 && res.data) {
      setUserInfo(res.data);
      setIsLoading(false);
    }
  }, [setUserInfo]);
  useEffect(() => {
    initUserInfo();
  }, [initUserInfo]);
  return (
    <>
      {isLoading ? (
        <div>
          <Spin />
        </div>
      ) : (
        <div className={styles.layoutContainer}>
          <Flex>
            <SideBar />
            <IndexContent />
          </Flex>
        </div>
      )}
    </>
  );
};

export default Index;
