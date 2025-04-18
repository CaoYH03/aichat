// 全局搜索
import { motion } from 'framer-motion';
const GlobalSearch = ({ isFold }: { isFold: boolean }) => {
  return (
    <motion.div
    initial={{ width: 0, opacity: 1 }}
    animate={{
      width: isFold ? 0 : 300,
      opacity: 1,
    }}
    transition={{
      duration: 0.2,
      ease: 'easeInOut',
    }}
    style={{
      willChange: 'width',
      overflowY: 'auto',
      height: '100%',
      transform: 'translateZ(0)',
      borderRadius: '0 12px 12px 0',
      backgroundColor: '#fff',
    }}>
      <div>
        sdasd
      </div>
    </motion.div>
  );
};
export default GlobalSearch;
