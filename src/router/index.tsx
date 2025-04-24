// react 路由配置
import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Index from "@client/pages/index";
import {isMobileDevice} from "@client/utils/index";
// 自定义路由包装器组件
const MobileRedirect = ({ children }: { children: React.ReactNode }) => {
  if (isMobileDevice()) {
    return <Navigate to="/m" replace />;
  }
  return children;
};
// 404 页面组件
const NotFound = () => <h1>404 - 页面不存在</h1>;
const MobileNotFound = () => <h1 className="text-center p-1">请在电脑端访问
<br />
<span className="text-gray-500">（手机端暂未开放）</span>
</h1>;
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <MobileRedirect>
          {/* <Suspense fallback={<div>加载中...</div>}> */}
            <Index />
          {/* </Suspense> */}
        </MobileRedirect>
      ),
    },
    {
      path: '/404',
      element: <NotFound />,
    },
    {
      path: '/m',
      element: <MobileNotFound />,
    },
    {
      // 捕获所有未匹配路由
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ],
  {
    basename: "/ai-agent",
  }
);

export default router;
