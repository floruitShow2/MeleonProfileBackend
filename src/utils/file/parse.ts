/**
 * @description 读取文件，解析其内容等相关函数
 */
// 获取 base64 编码数据的文件大小（字节）
export function getBase64FileSize(base64String) {
  // 移除 base64 字符串中的元数据部分
  const base64WithoutPrefix = base64String.split(',')[1]

  // 计算 base64 字符串的字节数
  const padding = base64WithoutPrefix.endsWith('==') ? 2 : base64WithoutPrefix.endsWith('=') ? 1 : 0
  const fileSize = (base64WithoutPrefix.length * 3) / 4 - padding

  return Math.floor(fileSize)
}

// 从 base64 编码数据中提取 MIME 类型
export function getMimeTypeFromBase64(base64String) {
  const match = base64String.match(/^data:([A-Za-z-+\/]+);base64,/)
  if (match && match.length > 1) {
    return match[1]
  }
  return null
}
