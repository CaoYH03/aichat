// 滚动到底部
import React from 'react';
import { ArrowDownOutlined } from '@ant-design/icons';

interface ScrollToBottomProps {
  onScrollToBottomClick: () => void;
  visible: boolean;
}

const ScrollToBottom: React.FC<ScrollToBottomProps> = ({
  visible,
  onScrollToBottomClick,
}) => {
  return (
    <div
      onClick={onScrollToBottomClick}
      className={`${
        visible ? 'block' : 'invisible'
      } w-[32px] h-[32px] border-1 border-[#e8eaf2] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#e0dfff] transition-all duration-300 hover:border-[#e0dfff] hover:text-[#615ced] absolute bottom-[122px] left-[50%] translate-x-[-50%] bg-[#fff]`}>
      <ArrowDownOutlined />
    </div>
  );
};

export default ScrollToBottom;
