// 移除代码块标记和json标识
function extractJsonFromCodeBlock(str: string): string | null {
    // 移除开头的 ```json\n 和结尾的 \n```
    const jsonPattern = /```json\n([\s\S]*)\n```/;
    const match = str.match(jsonPattern);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
}

/**
 * 解析包含代码块的字符串为JSON对象
 * @param inputString 包含JSON代码块的字符串
 * @returns 解析后的JSON对象或null
 */
export function parseJsonFromCodeBlock(inputString: string): any | null {
  // 提取JSON字符串
  const jsonString = extractJsonFromCodeBlock(inputString);
  
  // 解析JSON字符串为JavaScript对象
  let parsedData = null;
  try {
    if (jsonString) {
      parsedData = JSON.parse(jsonString);
      console.log("成功解析JSON数据");
      
      // 现在可以访问解析后的对象属性
      console.log("HTML长度:", parsedData.html?.length);
      console.log("CSS长度:", parsedData.css?.length);
      console.log("JS长度:", parsedData.js?.length);
    } else {
      console.error("无法提取JSON字符串");
    }
  } catch (error: unknown) {
    console.error("JSON解析错误:", (error as Error).message);
  }
  
  return parsedData;
}