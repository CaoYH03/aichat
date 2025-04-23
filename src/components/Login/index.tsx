// 登录弹窗
import { Modal, Input, Button, Space, Tabs, message } from 'antd';
import { useState } from 'react';
import ReactDom from "react-dom/client";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import type { ChangeEvent } from 'react';
import styles from './index.module.less';
import {
  getGeetest,
  geeVerify,
  getToken,
  getUserInfo,
  passwordLogin,
} from '@client/api/login';
import cookie from 'js-cookie';
import { useUserStore } from '@client/store/user';
interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

// 添加静态方法类型
interface LoginModalType extends React.FC<LoginModalProps> {
  show: () => () => void;
}

interface CaptchaObj {
  onSuccess: (callback: () => void) => void;
  destroy: () => void;
  reset: () => void;
  getValidate: () => {
    geetest_challenge: string;
    geetest_validate: string;
    geetest_seccode: string;
  };
  appendTo: (element: HTMLElement) => void;
}
declare const initGeetest: (
  params: {
    gt: string;
    challenge: string;
    offline: boolean;
    new_captcha: boolean;
    product: string;
  },
  callback: (captchaObj: CaptchaObj) => void
) => void;
const COUNT_DOWN_TIME = 60;
const LoginModal: LoginModalType = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(COUNT_DOWN_TIME);
  const [isCaptha, setIsCaptha] = useState(false);
  const [password, setPassword] = useState('');
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const handleSendCode = async () => {
    if (!phone.trim()) {
      message.error('请输入手机号');
      return;
    }
    setIsCaptha(true);
    const res = await getGeetest();
    initGeetest(
      {
        // 服务端 SDK
        gt: res.gt,
        challenge: res.challenge,
        offline: !res.success,
        new_captcha: true,
        product: 'popup',
      },
      (captchaObj: CaptchaObj) => {
        const captchaBox = document.getElementById('captcha');
        if (captchaBox) {
          captchaObj.appendTo(captchaBox);
        }
        captchaObj.onSuccess(async () => {
          setIsCaptha(false);
          const results = captchaObj.getValidate();
          const geetest_challenge = results.geetest_challenge;
          const geetest_validate = results.geetest_validate;
          const geetest_seccode = results.geetest_seccode;
          const response = await geeVerify({
            geetest_challenge: geetest_challenge,
            geetest_validate: geetest_validate,
            geetest_seccode: geetest_seccode,
            mobile: phone,
          });
          if (response.result === 'success') {
            message.success('验证码已发送，请注意查收');
            captchaObj.destroy();
            handleCountDown(captchaObj);
          } else {
            message.error('验证码送失败');
          }
        });
      }
    );
  };
  const handleCountDown = (captchaObj: CaptchaObj) => {
    setCountdown(COUNT_DOWN_TIME);
    const timer = setInterval(() => {
      if (countdown > 1) {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 60;
          }
          return prev - 1;
        });
        captchaObj.reset();
      }
    }, 1000);
    captchaObj.destroy();
  };
  const handleLogin = async () => {
    if (!phone || !code) {
      message.error('请输入手机号和验证码');
      return;
    }
    setLoading(true);
    const response = await getToken({
      mobile: phone,
      verificationCode: code,
      isRememberMe: true,
      source: 'pc',
      registerWebsite: location.href,
    });
    if (response.code === 200) {
      cookie.set('token', response.data.token);
      const userInfo = await getUserInfo();
      if (userInfo.code === 200) { 
        // 存在 zustand 中
        setUserInfo(userInfo.data);
        message.success('登录成功');
        onClose();
        // const preConversationId = sessionStorage.getItem('preConversationId');
        // if (preConversationId) {
        //   // todo 需要将 loginModal优化成 provider, 然后通过 context 传递参数,可以使用 react-router-dom 的 useSearchParams 来传递参数
        //   location.href = `/ai-agent?conversationId=${preConversationId}`;
        //   sessionStorage.removeItem('preConversationId');
        // }
      } else {
        message.error(userInfo.message);
      }
    } else {
      message.error(response.message);
    }
    setLoading(false);
  };
  const handlePasswordLogin = async () => {
    if (!phone || !password) {
      message.error('请输入手机号和密码');
      return;
    }
    setLoading(true);
    const response = await passwordLogin({
      isRememberMe: 1,
      mobile: phone,
      password,
    });
    if (response.code === 200) {
      cookie.set('token', response.data.token);
      const userInfo = await getUserInfo();
      if (userInfo.code === 200) { 
        // 存在 zustand 中
        setUserInfo(userInfo.data);
        message.success('登录成功');
        onClose();
        // const preConversationId = sessionStorage.getItem('preConversationId');
        // if (preConversationId) {
        //   // todo 需要将 loginModal优化成 provider, 然后通过 context 传递参数,可以使用 react-router-dom 的 useSearchParams 来传递参数
        //   location.href = `/ai-agent?conversationId=${preConversationId}`;
        //   sessionStorage.removeItem('preConversationId');
        // }
      } else {
        message.error(userInfo.message);
      }
    } else {
      message.error(response.message);
    }
    setLoading(false);
  };

  const items = [
    {
      key: 'phone',
      label: '手机号登录',
      children: (
        <div className="py-5">
          <div className="mb-4">
            <Input
              size="large"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPhone(e.target.value)
              }
              addonBefore="+86"
            />
          </div>
          <Space.Compact className="w-full">
            <Input
              size="large"
              placeholder="请输入验证码"
              value={code}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCode(e.target.value)
              }
            />
            <Button className={styles.getCodeBtn} onClick={handleSendCode}>
              {countdown < COUNT_DOWN_TIME
                ? `${countdown}秒后重新获取`
                : '获取验证码'}
            </Button>
          </Space.Compact>
          {isCaptha && (
            <div className="mt-4">
              <div id="captcha" className={styles.captcha}></div>
            </div>
          )}
          <Button
            type="primary"
            className="w-full bg-indigo-500! hover:bg-indigo-500! rounded-full mt-8"
            loading={loading}
            onClick={handleLogin}>
            登录
          </Button>
        </div>
      ),
    },
    {
      key: 'password',
      label: '密码登录',
      children: (
        <div className="py-5">
          <div className="mb-4">
            <Input
              size="large"
              className={styles.phoneInput}
              placeholder="请输入手机号"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPhone(e.target.value)
              }
              prefix={<UserOutlined />}
            />
          </div>
          <Space.Compact className="w-full">
            <Input.Password
              size="large"
              placeholder="请输入密码"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              prefix={<LockOutlined />}
            />
          </Space.Compact>
          <Button
            type="primary"
            className="w-full h-[40px]! bg-indigo-500! hover:bg-indigo-500! rounded-full mt-8"
            loading={loading}
            onClick={handlePasswordLogin}>
            登录
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      maskClosable={false}
      afterOpenChange={(open) => {
        if (!open) {
          setIsCaptha(false);
        }
      }}
      footer={null}
      width={400}
      centered
      className="rounded-xl">
      <div className="text-center mb-6">
        <img
          className="w-[100px] inline-block"
          src="https://www.iyiou.com/dist/src/assets/imgs/logo_pc.svg?e677367fd59712d0e73c22defd70b98e"
          alt="logo"
        />
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setPassword('');
          setCode('');
        }}
        items={items}
        centered
      />
    </Modal>
  );
};
LoginModal.show = () => {
  const LoginContainer = document.createElement("div");
  LoginContainer.className = "login-container";
  document.body.appendChild(LoginContainer);
  
  const root = ReactDom.createRoot(LoginContainer);
  const handleClose = () => {
    // 先卸载组件
    root.unmount();
    // 再移除容器
    if (document.body.contains(LoginContainer)) {
      document.body.removeChild(LoginContainer);
    }
  };

  root.render(
    <LoginModal 
      visible={true} 
      onClose={handleClose}
    />
  );

  // 返回关闭函数，允许外部调用关闭
  return handleClose;
};
export default LoginModal;
