export interface ApiResponse<T = unknown> {
  Code: number
  Message: string
  ReturnData: T
}
