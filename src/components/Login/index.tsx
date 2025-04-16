// 登录弹窗
import { Modal, Input, Button, Space, Tabs, message } from 'antd';
import { useState } from 'react';
import { QqOutlined, WechatOutlined } from '@ant-design/icons';
import type { ChangeEvent } from 'react';
import styles from './index.module.less';
import { getGeetest, geeVerify } from '@client/api/login';
interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
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
const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('phone');
  const [phone, setPhone] = useState('15545705995');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(COUNT_DOWN_TIME);
  const [isCaptha, setIsCaptha] = useState(false);
  const handleSendCode = async () => {
    if (!phone) {
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
  const handleLogin = () => {
    if (!phone || !code) {
      message.error('请输入手机号和验证码');
      return;
    }
    setLoading(true);
    // 模拟登录请求
    setTimeout(() => {
      setLoading(false);
      message.success('登录成功');
      onClose();
    }, 1500);
  };

  const items = [
    {
      key: 'phone',
      label: '手机号登录',
      children: (
        <div className="py-5">
          <div className="mb-4">
            <Input
              className={styles.phoneInput}
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
              className="h-[40px]"
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
            className="w-full h-[40px]! bg-indigo-500! hover:bg-indigo-500! rounded-full mt-8"
            loading={loading}
            onClick={handleLogin}>
            登录
          </Button>
          <div className="mt-6 text-center">
            <div className="text-gray-400 mb-4">其他登录方式</div>
            <div className="flex justify-center gap-6">
              <QqOutlined className="text-2xl text-gray-500 hover:text-indigo-600 cursor-pointer" />
              <WechatOutlined className="text-2xl text-gray-500 hover:text-indigo-600 cursor-pointer" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
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
        onChange={setActiveTab}
        items={items}
        centered
      />
    </Modal>
  );
};

export default LoginModal;
