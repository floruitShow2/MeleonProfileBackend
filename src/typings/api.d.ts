/**
 * 服务相关类型
 */
declare namespace Service {
  interface ServiceResponse {
    code: number
    message: string
    data: unknown
  }
}
