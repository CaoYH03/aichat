import { useEffect, useRef } from 'react';

// 自定义 hook，只在依赖项第一次变化时执行
export const useEffectOnFirstChange = (callback: () => void, dependency: any) => {
  const isFirstChange = useRef(true);
  const prevDep = useRef(dependency);

  useEffect(() => {
    // 检查依赖项是否发生变化
    if (prevDep.current !== dependency) {
      // 如果是第一次变化
      if (isFirstChange.current) {
        callback();
        isFirstChange.current = false;
      }
      // 更新前一个依赖项的值
      prevDep.current = dependency;
    }
  }, [dependency, callback]);
}