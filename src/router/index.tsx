// react 路由配置
import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Index from '@client/pages/index';
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>加载中...</div>}>
        <Index />
      </Suspense>
    ),
  }
]);

export default router;
