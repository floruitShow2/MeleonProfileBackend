import { Prop, Schema } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { UserEntity } from '@/modules/user/dto/user.dto'
import { IsEnum } from 'class-validator'
import { PickType } from '@nestjs/swagger'

export enum MessageTypeEnum {
  SYSTEM_NOTIFICATION = '1',
  FRIEND_REQUEST = '2'
}

@Schema()
export class MessageEntity extends Document {
  
  @Prop({ type: mongoose.Types.ObjectId, ref: UserEntity.name })
  readonly sender: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Types.ObjectId, ref: UserEntity.name })
  readonly receiver: mongoose.Types.ObjectId

  @Prop()
  @IsEnum(MessageTypeEnum)
  readonly type: MessageTypeEnum

  @Prop({ type: String })
  readonly content: string

  @Prop({ type: Boolean, default: false })
  readonly isRead: boolean

  @Prop()
  readonly createdAt: string
}

export class CreateMessageInput extends PickType(MessageEntity, ['sender', 'receiver', 'type', 'content']) {}