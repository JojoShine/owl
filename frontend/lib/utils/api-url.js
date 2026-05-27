/**
 * 获取完整的API地址
 * @param {string} endpoint - 接口端点
 * @returns {string} 完整的API地址
 */
export const getFullApiUrl = (endpoint) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  // 处理endpoint的路径
  const path = endpoint.startsWith('/custom') ? endpoint : `/custom${endpoint}`;
  
  // 移除baseURL末尾的斜杠，确保格式正确
  const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  
  return `${cleanBaseURL}${path}`;
};
