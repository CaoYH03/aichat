// 侧边栏
import { HomeFilled } from '@ant-design/icons'; 
import LoginModal from '../../Login';
import { useState } from 'react';

const SideBar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const content = (
  //   <div className="w-[400px] h-[200px] bg-[#fff]">
  //     <Button
  //       onClick={() => {
  //         setIsModalOpen(true);
  //       }}
  //       type="primary"
  //       className="w-[100px] h-[40px] bg-[#000]">
  //       登录
  //     </Button>
  //   </div>
  // );
  return (
    <div className="w-[72px] h-screen flex flex-col justify-between items-center p-[16px_0]">
      <img
        className="w-[calc(100%-16px)]"
        src="https://diting-hetu.iyiou.com/rprQtZu6HSGxmTmYtwsI.png"
        alt=""
      />
      {/* <Popover content={content} title="Title" placement="rightTop"> */}
        <HomeFilled
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="align-self-end cursor-pointer"
          style={{ fontSize: '32px', color: '#fff' }}
        />
      {/* </Popover> */}
      <LoginModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default SideBar;
