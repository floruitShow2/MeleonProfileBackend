import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document } from 'mongoose'

@Schema()
export class User extends Document {
  @Prop()
  @ApiProperty({
    description: '用户名'
  })
  readonly username: string

  @Prop()
  @ApiProperty({
    description: '用户密码',
    example: '123456'
  })
  readonly password: string

  @Prop()
  @ApiProperty({
    description: '用户头像'
  })
  readonly avatar: string
  @Prop()
  @ApiProperty({
    description: '邮箱'
  })
  readonly email: string
  @Prop()
  @ApiProperty({
    description: '职业ID'
  })
  readonly job: string
  @Prop()
  @ApiProperty({
    description: '职业名'
  })
  readonly jobName: string
  @Prop()
  @ApiProperty({
    description: '所属组织ID'
  })
  readonly organization: string
  @Prop()
  @ApiProperty({
    description: '所属组织名'
  })
  readonly organizationName: string
  @Prop()
  @ApiProperty({
    description: '地址ID'
  })
  readonly location: string
  @Prop()
  @ApiProperty({
    description: '地址'
  })
  readonly locationName: string
  @Prop()
  @ApiProperty({
    description: '简介'
  })
  readonly introduction: string
  @Prop()
  @ApiProperty({
    description: '个人网站'
  })
  readonly personalWebsite: string
  @Prop()
  @ApiProperty({
    description: '手机号'
  })
  readonly phone: string
  @Prop()
  @ApiProperty({
    description: '注册日期',
    example: '2023-09-26 22:24:36'
  })
  readonly registrationDate: string
  @Prop()
  @ApiProperty({
    description: '账户ID'
  })
  readonly accountId: string
  @Prop()
  @ApiProperty({
    description: '授权'
  })
  readonly certification: number
  @Prop()
  @ApiProperty({
    description: '用户角色'
  })
  readonly role: 'admin' | 'user'
}

@Schema()
export class UserSignUp extends Document {
  @Prop()
  @ApiProperty({
    description: '用户名'
  })
  readonly username: string

  @Prop()
  @ApiProperty({
    description: '用户密码',
    example: '123456'
  })
  readonly password: string
}
