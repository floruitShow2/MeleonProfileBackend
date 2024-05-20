import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import mongoose, { Document } from 'mongoose'
import { UserEntity } from '@/modules/user/dto/user.dto'

@Schema()
export class ChatRoomEntity extends Document {
  @Prop()
  @ApiProperty({
    description: '房间名'
  })
  @IsNotEmpty()
  roomName: string

  @Prop()
  @ApiProperty({
    description: '房间封面图片链接地址'
  })
  roomCover: string

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: UserEntity.name }] })
  @ApiProperty({
    description: '成员ID列表'
  })
  members: mongoose.Types.ObjectId[]

  // 其他配置项
  @Prop()
  @ApiProperty({
    description: '是否置顶'
  })
  isPinned: boolean

  @Prop()
  @ApiProperty({
    description: '是否开启免打扰'
  })
  noDisturbing: boolean

  // 配置项
  @Prop()
  @ApiProperty({
    description: '创建时间'
  })
  createTime: string

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User' })
  @ApiProperty({
    description: '创建人'
  })
  creator: mongoose.Types.ObjectId
}

export class ChatRoomInput extends PickType(ChatRoomEntity, ['roomName', 'roomCover']) {}

export class RemoveMemberInput {
  @IsNotEmpty()
  userId: string

  @IsNotEmpty()
  roomId: string
}