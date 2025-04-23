import {
    FireOutlined,
    ReadOutlined,
    RocketOutlined,
  } from '@ant-design/icons';
  import { Prompts } from '@ant-design/x';
  import { Space } from 'antd';
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
      <span style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>亿欧Ai，您的</span>
      <span style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>行业助手</span>
    </div>
  );
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
            description: `2024年融资企业有多少？`,
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
          '创建我的简报',
        ),
        description: '什么是简报？',
        children: [
          {
            key: '3-1',
            description: '帮助中心',
            url: 'https://help.iyiou.com',
          },
          {
            key: '3-2',
            description: '联系我们',
            url: 'https://help.iyiou.com',
          },
          {
            key: '3-3',
            description: '敬请期待...',
            disabled: true,
            url: 'https://help.iyiou.com',
          },
          {
            key: '3-4',
            description: '敬请期待...',
            disabled: true,
            url: 'https://help.iyiou.com',
          },
        ],
      },
    ], [recommendBrief]);
    const handleItemClick = (info:ItemClickInfoProps) => {
     const { data:{url, description} } = info;
     if(url) {
      window.open(url, '_blank');
      return;
     }
     handleClickRecommendItem(description);
    };
    return (
        // <Card
        //   style={{
        //     borderRadius: 0,

        //     border: 0,
        //   }}
        // >
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
        // </Card>
  );
};

export default Prompt;
