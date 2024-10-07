import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty, PickType } from '@nestjs/swagger'
import mongoose, { Document } from 'mongoose'
import { IsEnum, IsNotEmpty } from 'class-validator'
import { UserEntity } from '@/modules/user/dto/user.dto'

enum ChatRoomTypeEnum {
  // 普通群聊
  NORMAL = '1',
  // 团队群聊
  GROUP = '2',
  // 项目群聊
  PROJECT = '3'
}

@Schema()
export class ChatRoomEntity extends Document {
  // 基础信息
  @Prop()
  @ApiProperty({
    description: '房间名'
  })
  @IsNotEmpty()
  roomName: string

  @Prop()
  @ApiProperty({
    description: '房间描述'
  })
  roomDescription: string

  @Prop()
  @ApiProperty({
    description: '房间类型'
  })
  @IsNotEmpty()
  @IsEnum(ChatRoomTypeEnum)
  roomType: ChatRoomTypeEnum

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

  // 创建相关
  @Prop()
  @ApiProperty({
    description: '创建时间'
  })
  createTime: string

  @Prop({ type: mongoose.Types.ObjectId, ref: UserEntity.name })
  @ApiProperty({
    description: '创建人'
  })
  creator: mongoose.Types.ObjectId
}

export class CreateRoomInput extends PickType(ChatRoomEntity, [
  'roomName',
  'roomDescription',
  'members',
  'roomCover',
  'roomType'
]) {}

export class RemoveMemberInput {
  @IsNotEmpty()
  userId: string

  @IsNotEmpty()
  roomId: string
}

export class InviteMemberInput {
  @IsNotEmpty()
  roomId: string

  @IsNotEmpty()
  userIds: string[] | string
}
