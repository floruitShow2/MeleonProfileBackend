import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty, PickType } from '@nestjs/swagger'
import mongoose, { Document } from 'mongoose'
import { IsNotEmpty } from 'class-validator'
import { ChatRoomEntity } from '@/modules/chat-room/dto/chat-room.dto'
import { UserEntity } from '@/modules/user/dto/user.dto'
import { PaginationInput } from '@/interface/pagination.interface'

export enum MessageType {
  TEXT = 'text',
  Image = 'image'
}

@Schema()
export class ChatMessageEntity extends Document {
  @Prop()
  messageId: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Types.ObjectId, ref: ChatRoomEntity.name })
  @ApiProperty({
    description: '聊天室ID'
  })
  @IsNotEmpty()
  roomId: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Types.ObjectId, ref: UserEntity.name })
  @ApiProperty({
    description: '发布人ID'
  })
  profileId: mongoose.Types.ObjectId

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: UserEntity.name }] })
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

export class ChatMessageInput extends PickType(ChatMessageEntity, [
  'roomId',
  'profileId',
  'type',
  'content',
  'url'
]) {}

export class ChatMessagePagingInput extends PaginationInput {
  @IsNotEmpty()
  roomId: string
}
