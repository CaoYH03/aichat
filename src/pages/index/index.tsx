// 首页
import IndexContent from '@client/components/layout/IndexContent'
import SideBar from '@client/components/layout/SideBar'
import { Flex } from 'antd'
import './index.less'
// import { useConsoleProtection } from '@client/hooks/useAntiDebug'
const Index = () => {
  // useConsoleProtection()
  return (
    // 左右布局 侧边栏和聊天窗口 1:3
    <div className="layout-container">
      <Flex>
        <SideBar />
        <IndexContent />
      </Flex>
    </div>
  );
};

export default Index;
