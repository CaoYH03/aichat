// 首页
import IndexContent from '@client/components/layout/IndexContent';
import SideBar from '@client/components/layout/SideBar';
import { Flex, Spin } from 'antd';
import { useEffect, useCallback, useState } from 'react';
import { getUserInfo } from '@client/api/login';
import { getRecommendBrief } from '@client/api/index';
import { useUserStore } from '@client/store/user';
import { useRecommendBriefStore } from '@client/store/recommendBrief';
import styles from './index.module.less';
const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const setRecommendBrief = useRecommendBriefStore((state) => state.setRecommendBrief);
  const initUserInfo = useCallback(async () => {
    const res = await getUserInfo();
    if (res.code === 200 && res.data) {
      setUserInfo(res.data);
      const recommendBriefRes = await getRecommendBrief();
      if (recommendBriefRes.code === 200 && recommendBriefRes.data) {
        setRecommendBrief(recommendBriefRes.data.pageResponse.records || []);
      }
      setIsLoading(false);
    }
  }, [setUserInfo, setRecommendBrief]);
  useEffect(() => {
    sessionStorage.removeItem('loginModal');
    initUserInfo();
  }, [initUserInfo]);
  return (
    <>
      {isLoading ? (
        <div className="p-[8px]">
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
