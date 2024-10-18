export interface MemberType {
  userId: string
  joinTime: number | string
  /**
   * 0 创建人 拥有移交、注销团队或更新团队信息等权限
   * 1 管理员 拥有创建、编辑、删除团队项目等权限
   * 2 普通成员 仅拥有团队及其创建的项目的查看权限
   */
  role: 0 | 1 | 2
}

export interface TaskType {
  taskId: string
  createTime: string | number
}
