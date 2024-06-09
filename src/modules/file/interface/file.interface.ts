import { IsNotEmpty, IsNumber } from "class-validator"

export interface VerifyOptions {
  // 文件哈希
  filehash: string
  // 文件名称
  filename: string
}

export interface ChunkOptions {
  // 切片hash
  hash: string
  // 文件名
  filename: string
  // 文件hash
  filehash: string
}

export interface MergeOptions {
  size: number
  filename: string
  filehash: string
}

export class GetFrameInput {
  @IsNotEmpty()
  url: string

  @IsNumber()
  seconds: number
}
