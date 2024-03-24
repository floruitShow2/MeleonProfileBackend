import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document } from 'mongoose'

export interface MemberType {
  userId: string
  joinTime: string
  /**
   * 0 创建人 拥有移交、注销团队或更新团队信息等权限
   * 1 管理员 拥有创建、编辑、删除团队项目等权限
   * 2 普通成员 仅拥有团队及其创建的项目的查看权限
   */
  role: 0 | 1 | 2
}

export interface TaskType {
  taskId: string
  createTime: string
}

@Schema()
export class TeamEntity extends Document {
  @Prop()
  @ApiProperty({
    description: '团队ID'
  })
  readonly teamId?: string

  @Prop()
  @ApiProperty({
    description: '团队名称'
  })
  readonly teamName: string

  @Prop()
  @ApiProperty({
    description: '团队LOGO'
  })
  logo: string

  @Prop()
  @ApiProperty({
    description: '团队简介'
  })
  introduction: string

  @Prop()
  @ApiProperty({
    description: '创建人'
  })
  creator: string

  @Prop()
  @ApiProperty({
    description: '团队成员'
  })
  members: MemberType[]

  @Prop()
  @ApiProperty({
    description: '团队项目'
  })
  readonly tasks: TaskType[]

  @Prop()
  @ApiProperty({
    description: '创建时间'
  })
  createTime: string
}
