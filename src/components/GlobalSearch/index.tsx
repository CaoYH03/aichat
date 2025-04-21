// 全局搜索
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Input,
  Tabs,
  TabsProps,
  List,
  Tooltip,
  Flex,
  Divider,
  Descriptions,
  Button,
  message as messageAntd,
} from "antd";
import {
  searchCompany,
  searchIndustry,
  searchIntelligence,
  searchReport,
} from "@client/api/search";
import { useSearchStore } from "@client/store/search";
import styles from "./index.module.less";
import { Link } from "react-router-dom";
const host = import.meta.env.VITE_HOST;
const ListItemMap = {
  Company: (item: CompanyProps) => {
    return (
      <Flex vertical gap={16} className="flex-1">
        <Flex vertical gap={8}>
          <Tooltip title={item.fullName}>
            <Link style={{color: '#000'}} to={`https://${host}.iyiou.com/company/details/${item.comId}/profile`} target="_blank" className="text-[16px] font-bold hover:text-[#167ff5]! cursor-pointer ellipsis-1">
              {item.briefName}
            </Link>
          </Tooltip>
          <div className="text-[14px] text-[#999] ellipsis-1">
            {item.briefIntro || "-"}
          </div>
        </Flex>
        <Flex className="w-full" justify="space-between" align="center">
          <Flex vertical gap={8} className="text-[12px] text-[#999]">
            <span>成立</span>
            <span>{item.establishTime || "-"}</span>
          </Flex>
          <Divider type="vertical" />
          <Flex vertical gap={8} className="text-[12px] text-[#999]">
            <span>地区</span>
            <span>{item.companyContactHead[0]?.provinceStr}</span>
          </Flex>
          <Divider type="vertical" />
          <Flex vertical gap={8} className="text-[12px] text-[#999]">
            <span>融资阶段</span>
            <span>{item.investRoundStr || "-"}</span>
          </Flex>
        </Flex>
      </Flex>
    );
  },
  Industry: (item: IndustryProps) => {
    return (
      <Descriptions title={item.tagName} column={1} extra={
        <Button type="primary" size="small" onClick={() => {
          window.open(`https://${host}.iyiou.com/industry/details/${item.tagId}`, '_blank');
        }}>
          查看详情
        </Button>
      }>
        <Descriptions.Item label="市场规模">
          {item.marketSizeStr || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="规模增速（%）">
          {item.growthRateStr || "-"}
        </Descriptions.Item>
      </Descriptions>
    );
  },
  Intelligence: (item: IntelligenceProps) => {
    return (
      <Flex vertical gap={8}>
        <Tooltip title={item.title}>
          <Link style={{color: '#000'}} to={`https://${host}.iyiou.com/intelligence/details/${item.reportId}`} target="_blank" className="text-[16px] font-bold hover:text-[#167ff5]! cursor-pointer ellipsis-1">
            {item.title}
          </Link>
        </Tooltip>
        <div className="text-[14px] text-[#999] ellipsis-1">
          {item.summary || "-"}
        </div>
      </Flex>
    );
  },
  Report: (item: ReportProps) => {
    return (
      <Flex className="w-full" gap={8}>
        <img className="w-[48px]" src="https://diting-hetu.iyiou.com/16760184534902.png" alt="report cover" />
              <Flex className="flex-1" vertical gap={8}>
        <Tooltip title={item.title}>
          <Link style={{color: '#000'}} to={`https://${host}.iyiou.com/industry/report/reportlist/details/${item.reportId}/profile`} target="_blank" className="text-[14px] font-bold hover:text-[#167ff5]! cursor-pointer ellipsis-1">
            {item.title}
          </Link>
        </Tooltip>
        <Flex justify="space-between">
          <span className="text-[12px] text-[#999]">
            {item.industryName || "-"}
          </span>
          <span className="text-[12px] text-[#999]">
            {item.pubTime || "-"}
          </span>
        </Flex>
      </Flex>
      </Flex>
    );
  },
};
const requestMap = {
  Company: searchCompany,
  Industry: searchIndustry,
  Intelligence: searchIntelligence,
  Report: searchReport,
};
const GlobalSearch = ({ isFold }: { isFold: boolean }) => {
  const {setRecordList, setTotal, setPage, recordList, total, page} = useSearchStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState("Company");
  const tabs: TabsProps["items"] = [
    {
      key: "Company",
      label: "企业",
    },
    {
      key: "Industry",
      label: "行业",
    },
    {
      key: "Intelligence",
      label: "情报",
    },
    {
      key: "Report",
      label: "报告",
    },
  ];
  const searchFunc = async (func: (keyword: string, page: number) => Promise<{ code: number; data: { response: { records: [], total: number } }, message: string }>, page: number, keyword: string) => {
    const res = await func(keyword, page);
    const { code, data } = res;
    if (code === 200 && data) {
      setRecordList(data.response.records);
      setTotal(data.response.total);
    } else{
      setRecordList([]);
      setTotal(0);
    }
    setIsLoading(false);
  };
  const onChange = (key: string) => {
    setIsLoading(true);
    setPage(1);
    setTotal(0);
    setRecordList([]);
    setSearchType(key);
    if (!searchValue) {
      setIsLoading(false);
      return;
    };
    searchFunc(requestMap[key], 1, searchValue);
  };
  const onSearch = async (value: string) => {
    setSearchValue(value);
    setIsLoading(true);
    searchFunc(requestMap[searchType], page, value);

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
        ease: "easeInOut",
      }}
      style={{
        willChange: "width",
        overflowY: "auto",
        height: "100%",
        transform: "translateZ(0)",
        borderRadius: "0 12px 12px 0",
        backgroundColor: "#fff",
      }}
    >
      <div className="p-[0_20px_20px]">
        <div className="sticky top-0 bg-[#fff] z-10 pt-[20px]">
          <Input.Search
            placeholder="搜索"
            onSearch={onSearch}
            loading={isLoading}
          />
          <Tabs
            defaultActiveKey={searchType}
            items={tabs}
            onChange={onChange}
          />
        </div>
        <List
          className={styles.searchList}
          dataSource={recordList}
          itemLayout="horizontal"
          loading={isLoading}
          pagination={{
            defaultCurrent: 1,
            total: total,
            onChange: (page) => {
              setPage(page);
              searchFunc(requestMap[searchType], page, searchValue);
            },
            pageSize: 20,
            current: page,
            showSizeChanger: false,
            size: "small",
            hideOnSinglePage: true,
            align: "center",
          }}
          renderItem={(item) => (
            <List.Item>{ListItemMap[searchType](item)}</List.Item>
          )}
        ></List>
      </div>
    </motion.div>
  );
};
export default GlobalSearch;
