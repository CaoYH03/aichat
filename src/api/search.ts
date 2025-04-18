import request from '@client/request';
/**
 * 全局搜索->搜索企业列表
 */
export const searchCompany = async (keyword: string) => {
    return request(`/spa/search/company?keyword=${keyword}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
  /**
   * 全局搜索->搜索行业列表
   */
  export const searchIndustry = async (keyword: string) => {
    return request(`/spa/search/tag?keyword=${keyword}`, {
      method: 'GET',
    });
  };
  /**
   * 全局搜索->搜索情报列表
   */
  export const searchIntelligence = async (keyword: string) => {
    return request(`/spa/search/intelligence?keyword=${keyword}`, {
      method: 'GET',
    });
  };
  /**
   * 全局搜索->搜索报告列表
   */
  export const searchReport = async (keyword: string) => {
    return request(`/spa/search/report?keyword=${keyword}`, {
      method: 'GET',
    });
  };
