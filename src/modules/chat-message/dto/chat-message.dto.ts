import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger'
import mongoose, { Document } from 'mongoose'
import { IsInt, IsNotEmpty, Min } from 'class-validator'
import { ChatRoomEntity } from '@/modules/chat-room/dto/chat-room.dto'
import { UserEntity, UserResponseEntity } from '@/modules/user/dto/user.dto'
import { PaginationInput } from '@/interface/pagination.interface'
import { MessageTypeEnum, FileTypeEnum } from '@/constants'
import { Transform } from 'class-transformer'

export interface ChatMessageMention {
  username: string
  userId: string
  avatar: string
  offset: number
}
export interface ChatMessageEmoji {
  url: string
  offset: number
}

@Schema()
export class ChatMessageEntity extends Document {
  @Prop()
  messageId: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Types.ObjectId, ref: ChatMessageEntity.name })
  @ApiProperty({
    description: '回复操作里, 目标消息的ID'
  })
  replyId?: mongoose.Types.ObjectId

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
  @IsNotEmpty()
  profileId: mongoose.Types.ObjectId

  @Prop()
  @ApiProperty({
    description: '消息提及的用户'
  })
  mentions: ChatMessageMention[]

  @Prop()
  @ApiProperty({
    description: '消息涉及的 emoji 图片'
  })
  emojis: ChatMessageEmoji[]

  @Prop()
  @ApiProperty({
    description: '消息发布时间'
  })
  createTime: number

  @Prop()
  @ApiProperty({
    description: '消息类型'
  })
  type: MessageTypeEnum | FileTypeEnum

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

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: UserEntity.name }] })
  @ApiProperty({
    description: '可以看到当前消息的用户ID列表'
  })
  visibleUsers: mongoose.Types.ObjectId[]

  @Prop()
  @ApiProperty({
    description: '当前消息被哪些用户已读'
  })
  readUsers: mongoose.Types.ObjectId[]
}

@Schema()
export class ChatMessageResponseEntity extends OmitType(ChatMessageEntity, ['profileId']) {
  @Prop()
  @ApiProperty({
    description: '消息发送者的用户信息'
  })
  profile: UserResponseEntity

  @Prop()
  @ApiProperty({
    description: '回复的目标消息'
  })
  replyMessage: ChatMessageResponseEntity
}

export class ChatMessageInput extends PickType(ChatMessageEntity, [
  'roomId',
  'replyId',
  'profileId',
  'createTime',
  'type',
  'content',
  'mentions',
  'emojis',
  'url'
]) {}

export class ChatMessagePagingInput extends PaginationInput {
  @IsNotEmpty()
  roomId: string
}

export class ChatMessageLocatedInput {
  @IsNotEmpty()
  roomId: string

  @IsNotEmpty()
  messageId: string

  @IsNotEmpty()
  @IsInt()
  @Min(10)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  pageSize: number
}

export class UpdateChatMessageInput extends PickType(ChatMessageEntity, [
  'messageId',
  'content',
  'type'
]) {}
