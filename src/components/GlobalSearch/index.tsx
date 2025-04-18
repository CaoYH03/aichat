// 全局搜索
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input, Tabs, TabsProps, List, Tooltip, Flex, Divider } from 'antd';
import { searchCompany, searchIndustry, searchIntelligence, searchReport } from '@client/api/search';
import { useSearchStore } from '@client/store/search';
const ListItemMap = {
  Company: (item: CompanyProps) => {
    return (
      <Flex vertical gap={16} className='flex-1'> 
      <Flex vertical gap={8}>
            <Tooltip title={item.fullName}>
            <div className="text-[16px] font-bold hover:text-[#167ff5] cursor-pointer ellipsis-1">{item.briefName}</div>
          </Tooltip>
            <div className="text-[14px] text-[#999] ellipsis-1">{item.briefIntro || '-'}</div>
            </Flex>
            <Flex className='w-full'  justify='space-between' align='center'>
              <Flex vertical gap={8} className='text-[12px] text-[#999]'>
                <span>
                  成立
                </span>
                <span>
                  {item.establishTime || '-'}
                </span>
              </Flex>
              <Divider type='vertical' />
              <Flex vertical gap={8} className='text-[12px] text-[#999]'>
                <span>
                  地区
                </span>
                <span>
                  {item.companyContactHead[0]?.provinceStr}
                </span>
              </Flex>
              <Divider type='vertical' />
              <Flex vertical gap={8} className='text-[12px] text-[#999]'>
                <span>
                  融资阶段
                </span>
                <span>
                  {item.investRoundStr || '-'}
                </span>
              </Flex>
            </Flex>
          </Flex>
        )
      },
      Industry: (item: IndustryProps) => {
        return (
          <div>
            {item.tagName}
          </div>
        )
      }
}
const GlobalSearch = ({ isFold }: { isFold: boolean }) => {
  const setRecordList  = useSearchStore((state) => state.setRecordList);
  const recordList = useSearchStore((state) => state.recordList);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState('Company');
  const tabs: TabsProps['items'] = [
    {
      key: 'Company',
      label: '企业',
    },
    {
      key: 'Industry',
      label: '行业',
    },
    {
      key: 'Intelligence',
      label: '情报',
    },
    {
      key: 'Report',
      label: '报告',
    },
  ];
  const onChange = (key: string) => {
    setSearchType(key)
    switch(key) {
      case 'Company':
        searchFunc(searchCompany)
        break;
      case 'Industry':
        searchFunc(searchIndustry)
        break;
      case 'Intelligence':
        searchFunc(searchIntelligence)
        break;
      case 'Report':
        searchFunc(searchReport)
        break;
    }
  };
  const searchFunc = async (func) =>{
    const res = await func(searchValue);
    const {code, data} = res;
    if(code === 200 && data) {
      setRecordList(data.response.records)
      setIsLoading(false)
    }
  }
  const onSearch = async (value: string) => {
    setSearchValue(value)
    setIsLoading(true)
   const res = await searchCompany(value);
   const {code, data} = res;
   if(code === 200 && data) {
    setRecordList(data.response.records)
    setIsLoading(false)
   }

  };
  return (
    <motion.div
    initial={{ width: 0, opacity: 1 }}
    animate={{
      width: isFold ? 0 : 400,
      opacity: 1,
    }}
    transition={{
      duration: 0.2,
      ease: 'easeInOut',
    }}
    style={{
      willChange: 'width',
      overflowY: 'auto',
      height: '100%',
      transform: 'translateZ(0)',
      borderRadius: '0 12px 12px 0',
      backgroundColor: '#fff',
    }}>
      <div className="p-[0_20px_20px]">
        <div className='sticky top-0 bg-[#fff] z-10 pt-[20px]'>
        <Input.Search placeholder="搜索"  onSearch={onSearch} loading={isLoading}/>
        <Tabs defaultActiveKey={searchType} items={tabs} onChange={onChange} />
        </div>
        <List dataSource={recordList} itemLayout="horizontal"  renderItem={(item) => (
      <List.Item>
        {ListItemMap[searchType](item)}
      </List.Item>
    )} />
      </div>
    </motion.div>
  );
};
export default GlobalSearch;
