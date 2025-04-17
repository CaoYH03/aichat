// 侧边栏
import { useMemo } from 'react';
import { HomeFilled } from '@ant-design/icons';
import { Popover } from 'antd';
import LoginModal from '@client/components/Login';
import { useUserStore } from '@client/store/user';

const SideBar = () => {
  const userInfo = useUserStore((state) => state.userInfo);
  const content = useMemo(() => {
    return (
      <div className="w-[400px] h-[200px] bg-[#fff]">
        <div>
          <div>
            <img src={userInfo?.position} alt="" />
          </div>
          <div>
            <div>{userInfo?.user_name}</div>
            <div>{userInfo?.email}</div>
          </div>
        </div>
      </div>
    );
  }, [userInfo]);
  const handleLogin = () => {
    if (!userInfo) {
      LoginModal.show();
    }
  };
  return (
    <div className="w-[72px] h-screen flex flex-col justify-between items-center p-[16px_0]">
      <img
        className="w-[calc(100%-16px)]"
        src="https://diting-hetu.iyiou.com/rprQtZu6HSGxmTmYtwsI.png"
        alt=""
      />
      <Popover content={content} title="title" placement="rightTop">
        <HomeFilled
          onClick={handleLogin}
          className="align-self-end cursor-pointer"
          style={{ fontSize: '32px', color: '#fff' }}
        />
      </Popover>
    </div>
  );
};

export default SideBar;
