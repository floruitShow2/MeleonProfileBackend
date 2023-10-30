import { Document } from 'mongoose'
import { Schema, Prop } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

@Schema()
export class BlogEntity extends Document {
  @Prop()
  @ApiProperty({
    description: '文章名称'
  })
  readonly filename: string

  @Prop()
  @ApiProperty({
    description: '文章内容，将 md 文档解析为字符串',
    example: '## 二级标题'
  })
  readonly content: string

  @Prop()
  @ApiProperty({
    description: '分类标签'
  })
  readonly tags: string[]

  @Prop()
  @ApiProperty({
    description: '发布人，无需传递，后端自行解析token'
  })
  publisher: string

  @Prop()
  @ApiProperty({
    description: '发布时间，无需传递，以服务器端时间为准'
  })
  publishTime: string
}
