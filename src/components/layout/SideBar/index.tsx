// 侧边栏
import { HomeFilled } from '@ant-design/icons';
import LoginModal from '@client/components/Login';
import { useIsLogin } from '@client/hooks/useIsLogin';

const SideBar = () => {
  const [isLogin] = useIsLogin();
  const handleLogin = () => {
    if (!isLogin) {
      LoginModal.show();
    }
  };
  return (
    <div className="w-[72px] shrink-0 h-screen flex flex-col justify-between items-center p-[16px_0]">
      <img
        className="w-[calc(100%-32px)]"
        src="https://diting-hetu.iyiou.com/WQqzPvJ9yjWMlsaZDFbo.png"
        alt=""
      />
      {
      isLogin ?
        <HomeFilled
          className="align-self-end cursor-pointer"
          style={{ fontSize: '26px', color: '#fff' }}
        />
        :
        <div className="bg-[rgba(255,255,255,0.15)] rounded-[50%] flex justify-center items-center p-[10px] cursor-pointer" onClick={handleLogin}>
          <span className="text-[14px] text-[#fff] leading-[26px]">登录</span>
        </div>
      }
    </div>
  );
};

export default SideBar;
