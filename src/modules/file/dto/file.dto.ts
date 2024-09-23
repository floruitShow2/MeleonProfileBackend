import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import mongoose, { Document } from 'mongoose'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { UserEntity } from '@/modules/user/dto/user.dto'

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

@Schema()
export class FileEntity extends Document {
  @Prop()
  @ApiProperty({
    description: '文件ID'
  })
  fileId: string

  @Prop()
  @ApiProperty({
    description: '文件名'
  })
  fileName: string

  @Prop()
  @ApiProperty({
    description: '创建时间'
  })
  createTime: string

  @Prop({ type: mongoose.Types.ObjectId, ref: UserEntity.name })
  @ApiProperty({
    description: '创建人id'
  })
  createdBy: string

  @Prop()
  @ApiProperty({
    description: '文件大小'
  })
  @IsNumber()
  fileSize: number

  @Prop()
  @ApiProperty({
    description: '文件地址'
  })
  fileSrc: string

  @Prop()
  @ApiProperty({
    description: '文件类型'
  })
  fileType: string
}

export class GetFrameInput {
  @IsNotEmpty()
  url: string

  @IsNumber()
  seconds: number
}

export class DataUrlUploadInput {
  @IsNotEmpty()
  dataUrl: string

  @IsNotEmpty()
  fileName: string
}
