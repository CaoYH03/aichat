// react 路由配置
import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '@client/App';
import Chat from '@client/pages/Chat';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>加载中...</div>}>
        <Chat />
      </Suspense>
    ),
  },
  {
    path: '/chat',
    element: (
      <Suspense fallback={<div>加载中...</div>}>
        <App />
      </Suspense>
    ),
  },
]);

export default router;
