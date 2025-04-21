// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './App.css'
import router from './router/index.tsx'
import zhCN from 'antd/locale/zh_CN';
import { ConfigProvider } from 'antd';
createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <ConfigProvider locale={zhCN}>
    <RouterProvider router={router} />
  </ConfigProvider>
  // </StrictMode>
)
