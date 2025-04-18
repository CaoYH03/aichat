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
}
