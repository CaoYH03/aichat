import request from '@client/request';
/**
 * 全局搜索->搜索企业列表
 */
export const searchCompany = async (keyword: string, page: number = 1, pageSize: number = 20) => {
    return request(`/spa/search/company?keyword=${keyword}&page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
  /**
   * 全局搜索->搜索行业列表
   */
  export const searchIndustry = async (keyword: string, page: number = 1, pageSize: number = 20) => {
    return request(`/spa/search/tag?keyword=${keyword}&page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
    });
  };
  /**
   * 全局搜索->搜索情报列表
   */
  export const searchIntelligence = async (keyword: string, page: number = 1, pageSize: number = 20) => {
    return request(`/spa/search/intelligence?keyword=${keyword}&page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
    });
  };
  /**
   * 全局搜索->搜索报告列表
   */
  export const searchReport = async (keyword: string, page: number = 1, pageSize: number = 20) => {
    return request(`/spa/search/research?keyword=${keyword}&page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
    });
  };
