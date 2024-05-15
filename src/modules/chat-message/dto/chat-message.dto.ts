import mongoose, { Document } from 'mongoose'
import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

export enum MessageType {
  TEXT = 'text',
  Image = 'image'
}

@Schema()
export class ChatMessageEntity extends Document {
  @Prop({ type: { type: mongoose.Types.ObjectId, ref: 'ChatRoom' } })
  @ApiProperty({
    description: '聊天室ID'
  })
  roomId: string

  @Prop({ type: { type: mongoose.Types.ObjectId, ref: 'User' } })
  @ApiProperty({
    description: '发布人ID'
  })
  profileId: mongoose.Types.ObjectId

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'User' }] })
  @ApiProperty({
    description: '消息提及的用户'
  })
  metions: mongoose.Types.ObjectId[]

  @Prop()
  @ApiProperty({
    description: '消息发布时间'
  })
  createTime: string

  @Prop()
  @ApiProperty({
    description: '消息类型'
  })
  type: MessageType

  @Prop()
  @ApiProperty({
    description: '消息内容'
  })
  content: string

  @Prop()
  @ApiProperty({
    description: '文件资源链接，图片类型与文件类型共用，展示组件前端控制'
  })
  url: string
}
