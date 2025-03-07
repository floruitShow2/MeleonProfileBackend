import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document } from 'mongoose'
import { MemberType, TaskType } from '../interface/team.interface'

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
  createTime: number
}
