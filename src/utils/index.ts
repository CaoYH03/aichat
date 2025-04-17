export function addSearchParams(key: string, value: string) {
  const currentUrl = window.location.href;
  // 创建一个 URL 对象
  const url = new URL(currentUrl);
  // 设置或更新 sessionId 参数
  url.searchParams.set(key, value);
  if (!value) {
    url.searchParams.delete(key);
  }
  // 使用 History API 更新 URL 而不刷新页面
  window.history.pushState({}, '', url.toString());
}

export function compareDate(target: number, date: number) {
  const dateObj = new Date(date);
  const targetObj = new Date(target);
  
  // Check if same day by comparing year, month, and day
  const isSameDay = 
    dateObj.getFullYear() === targetObj.getFullYear() &&
    dateObj.getMonth() === targetObj.getMonth() &&
    dateObj.getDate() === targetObj.getDate();
  
  if (isSameDay) {
    return '今天';
  }
  
  // Calculate days difference for the "last 7 days" logic
  const diffTime = Math.abs(dateObj.getTime() - targetObj.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) {
    return '最近七天';
  }
  
  return '更早';
}
