import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document, Types } from 'mongoose'
import type { TagType } from '@/interface/tag.interface'
import { UserEntity } from '@/modules/user/dto/user.dto'

enum TaskGroups {
  Todo = 'todo',
  Progress = 'progress',
  Review = 'review',
  Schedule = 'schedule'
}

@Schema()
class TaskEntity extends Document {
  @Prop()
  taskId?: string

  @Prop()
  @ApiProperty({
    description: '任务分组',
    enum: TaskGroups
  })
  group: TaskGroups

  @Prop()
  @ApiProperty({
    description: '任务标题'
  })
  title: string

  @Prop()
  @ApiProperty({
    description: '任务描述'
  })
  desc: string

  @Prop()
  @ApiProperty({
    description: '任务卡片封面'
  })
  coverImage: string

  @Prop()
  @ApiProperty({
    description: '任务开始时间'
  })
  startTime: string

  @Prop()
  @ApiProperty({
    description: '任务结束时间'
  })
  endTime: string

  @Prop()
  @ApiProperty({
    description: '任务标签'
  })
  tags: TagType[]

  @Prop()
  @ApiProperty({
    description: '任务创建人'
  })
  creator: string

  @Prop()
  @ApiProperty({
    description: '任务创建时间'
  })
  createTime: string

  @Prop()
  @ApiProperty({
    description: '上次更新时间'
  })
  lastUpdateTime: string

  @Prop({ type: [{ type: Types.ObjectId, ref: UserEntity.name }] })
  @ApiProperty({
    description: '任务关联用户'
  })
  relatives: string[]

  @Prop()
  @ApiProperty({
    description: '任务关联文件'
  })
  attachments: string[]
}

export default TaskEntity

export interface TaskSearchOptions {
  title: string
  tags: string[]
  startDate: string
  endDate: string
}
