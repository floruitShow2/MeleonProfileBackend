import { TaskEntity } from '@/modules/task/dto/task.dto'
import { UserEntity } from '@/modules/user/dto/user.dto'
import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document, Types } from 'mongoose'

@Schema()
export class CommentEntity extends Document {
  @Prop({ type: Types.ObjectId, ref: TaskEntity.name })
  @ApiProperty({
    description: '评论对应的功能的ID,比如任务ID'
  })
  targetId: string

  @Prop()
  @ApiProperty({
    description: '评论id，mongodb自动生成，用于绑定回复信息'
  })
  commentId?: string

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  @ApiProperty({
    description: '发布人ID'
  })
  publisher: string

  @Prop()
  @ApiProperty({
    description: '发布时间'
  })
  publishTime: string

  @Prop()
  @ApiProperty({
    description: '评论内容'
  })
  content: string

  @Prop()
  @ApiProperty({
    description: '回复的评论的id列表'
  })
  replyId?: string

  @Prop({
    type: [{ user: { type: Types.ObjectId, ref: UserEntity.name }, time: { type: String } }]
  })
  @ApiProperty({
    description: '喜爱数'
  })
  likes: Array<{ user: string; time: string }>
}
