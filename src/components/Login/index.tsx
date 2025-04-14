// 登录弹窗
import { Modal, Input, Button, Space, Tabs, message } from 'antd';
import { useState } from 'react';
import { QqOutlined, WechatOutlined } from '@ant-design/icons';
import type { ChangeEvent } from 'react';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    if (!phone) {
      message.error('请输入手机号');
      return;
    }
    message.success('验证码已发送');
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
              className="h-[40px]! login-input"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              addonBefore="+86"
            />
          </div>
          <Space.Compact className="w-full">
            <Input
              className="h-[40px]"
              placeholder="请输入验证码"
              value={code}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
            />
            <Button className="h-[40px]!" onClick={handleSendCode}>
              获取验证码
            </Button>
          </Space.Compact>
          <Button
            type="primary"
            className="w-full h-10 mt-2 bg-indigo-600 hover:bg-indigo-700 rounded-full"
            loading={loading}
            onClick={handleLogin}
          >
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
    }
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
      className="rounded-xl"
    >
      <div className="text-center mb-6">
        <img className="w-[100px] inline-block" src="https://www.iyiou.com/dist/src/assets/imgs/logo_pc.svg?e677367fd59712d0e73c22defd70b98e" alt="logo" />
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

