// 
declare type RecordItem<T> = {
    id: number;
    timestamp: Date;
  }&T
  interface CompanyContactHead {
    provinceStr: string;
    cityStr: string;
    areaStr: string;
  }
declare type CompanyProps = {
    briefIntro: string;
    briefName: string;
    comId: string;
    comOtherName: string;
    companyContactHead: CompanyContactHead[];
    establishTime: string;
    fullName: string;
    highlight: {
        briefName: string;
        comOtherName: string;
        fullName: string;
    };
    industry: string;
    industryName: string;
    investRound: number;
    investRoundStr: string;
    latestInvestAmount: number;
    latestInvestCurrency: number;
    latestInvestCurrencyStr: string;
    latestInvestRound: null;
    latestInvestRoundStr: string;
    latestInvestTime: null;
    latestInvestor: [];
    latestInvestorStr: string;
    marketValuationRmb: number;
    tags: {
        tagId: string;
        tagName: string;
        tagRank: number;
        type: number;
    };
}
declare type IndustryProps = {
    tagName: string; // 行业名称
    marketSizeStr: string; // 市场规模
    growthRateStr: string; // 增长率
    tagId: string; // 行业ID
}
declare type IntelligenceProps = {
    title: string; // 标题
    summary: string; // 摘要
    reportId: string; // 情报ID
}
declare type ReportProps = {
    title: string; // 标题
    industryName: string; // 摘要
    reportId: string; // 报告ID
    pubTime: string; // 发布时间
}
