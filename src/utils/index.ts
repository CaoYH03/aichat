export function addSearchParams(key: string, value: string) {
  const currentUrl = window.location.href;
  // 创建一个 URL 对象
  const url = new URL(currentUrl);
  // 设置或更新 sessionId 参数
  url.searchParams.set(key, value);
  if (!value) {
    console.log('delete', key);
    url.searchParams.delete(key);
  }
  // 使用 History API 更新 URL 而不刷新页面
  window.history.pushState({}, '', url.toString());
}