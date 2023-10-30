import { ApiResponse } from '@/interface/response.interface'

export function getSuccessResponse<T>(msg: string, data: T): ApiResponse {
  return {
    Code: 1,
    Message: msg,
    ReturnData: data
  }
}
export function getFailResponse<T>(msg: string, data: T): ApiResponse {
  return {
    Code: -1,
    Message: msg,
    ReturnData: data
  }
}
