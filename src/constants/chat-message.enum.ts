export enum MessageTypeEnum {
  // 文本类型
  TEXT = 'text',
  // markdown 文档
  MARKDOWN = 'markdown',
  // 聊天消息【ai回复的消息，此类消息的内容流式返回，全部返回后更新为 MARKDOWN】
  CHAT = 'chat',
  // 操作类型：撤回消息、加入群聊、退出群聊、修改群名称...
  ACTION = 'action'
}
