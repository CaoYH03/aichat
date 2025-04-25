import {
    FireOutlined,
    ReadOutlined,
    RocketOutlined,
    CloseOutlined,
  } from '@ant-design/icons';
  import { Prompts } from '@ant-design/x';
  import { Space, Modal } from 'antd';
  import React, { useMemo } from 'react';
  import { useRecommendBriefStore } from '@client/store/recommendBrief';
  import styles from './index.module.less';
  const host = import.meta.env.VITE_HOST;
  interface ItemClickInfoProps {
    data: {
      shareId: string;
      key: string;
      url: string;
      description: string;
      onClick?: () => void;
    };
  }
  const renderTitle = (icon: React.ReactNode, title: string) => (
    <Space align="start">
      {icon}
      <span>{title}</span>
    </Space>
  );
  const promptTitle = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>小欧AI，</span>
      <span style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>亿欧产业智能体</span>
    </div>
  );
  // const connectModal = (open: boolean, setOpen: (open: boolean) => void) => {
  //   return (
  //     <Modal
  //       title="联系我们"
  //       open={open}
  //       onCancel={() => setOpen(false)}
  //     >
  //     </Modal>
  //   )
  // }
  const { info } = Modal;
  const connectModal = () => {
    info({
      title: (
        <div className='text-center text-[#333] relative top-[-8px]'>
          <span>联系我们</span>
          <CloseOutlined style={{ color: '#333', fontSize: 16, cursor: 'pointer', position: 'absolute', right: '-20px' }} onClick={() => Modal.destroyAll()} />
        </div>
      ),
      content: (
        <div className='text-center flex flex-col items-center text-[#333]'>  
          <p className='mb-4'>扫描二维码，联系官方客服</p>
          <img className='w-[100px] mx-auto mb-4' src="https://diting-hetu.iyiou.com/16893219646440.png" alt="联系我们" />
          <p>电话：188-1134-6150</p>
          <p>邮箱：songjianfeng@iyiou.com</p>
        </div>
      ),
      icon: null,
      footer: null,
      closeIcon: <CloseOutlined />,
      onCancel: () => {},
    });
  }
  const Prompt = ({handleClickRecommendItem}: {handleClickRecommendItem: (description: string) => void}) => {
    const recommendBrief = useRecommendBriefStore((state) => state.recommendBrief);
    const items = useMemo(() => [
      {
        key: '1',
        label: renderTitle(
          <FireOutlined
            style={{
              color: '#FF4D4F',
            }}
          />,
          '热门问题',
        ),
        description: '您想了解什么？',
        children: [
          {
            key: '1-1',
            description: `快速了解汽车出行行业`,
          },
          {
            key: '1-2',
            description: '半导体领域都有哪些企业？',
          },
          {
            key: '1-3',
            description: `人员规模大于100的上海汽车出行企业`,
          },
          {
            key: '1-4',
            description: `北京人工智能企业有哪些？`,
          },
        ],
      },
      {
        key: '2',
        label: renderTitle(
          <ReadOutlined
            style={{
              color: '#1890FF',
            }}
          />,
          '精选动态',
        ),
        description: '想知道最近的动态吗？',
        children: recommendBrief.map((item) => ({
          key: item.shareId,
          description: item.title,
          url: `https://${host}.iyiou.com/share/briefing/${item.shareId}`,
        })),
      },
      {
        key: '3',
        label: renderTitle(
          <RocketOutlined
            style={{
              color: '#722ED1',
            }}
          />,
          '快捷工具',
        ),
        description: '什么是简报？',
        children: [
          {
            key: '3-1',
            description: '亿欧数据',
            url: `https://${host}.iyiou.com/`,
          },
          {
            key: '3-2',
            description: '创建我的简报',
            url: `https://${host}.iyiou.com/work/intelligence/briefing`,
          },
          {
            key: '3-3',
            description: '帮助中心',
            url: `https://${host}.iyiou.com/share/briefing/sTwN2aP01X`,
          },
          {
            key: '3-4',
            description: '联系我们',
            onClick: connectModal,
          },
        ],
      },
    ], [recommendBrief]);
    const handleItemClick = (info:ItemClickInfoProps) => {
     const { data:{url, description, onClick} } = info;
     if(url) {
      window.open(url, '_blank');
      return;
     }
     if(onClick) {
      onClick();
      return;
     }
     handleClickRecommendItem(description);
    };
    return (
              <Prompts
            className={styles.prompt}
            title={promptTitle}
            items={items}
            wrap
            styles={
              {
              item: {
                flex: '0.33',
                backgroundImage: `linear-gradient(137deg, rgb(229, 244, 255) 0%, rgb(203, 219, 255) 100%)`,
                border: 0,
                margin: '0 6px',
              },
              subItem: {
                background: 'rgba(255,255,255,0.45)',
                border: '1px solid #fff',
              },
            }}
            onItemClick={handleItemClick}
          />
  );
};

export default Prompt;
