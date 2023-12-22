import { Role } from '@/constants/auth'
import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsNotEmpty, MinLength } from 'class-validator'
import { Document } from 'mongoose'

@Schema()
export class UserEntity extends Document {
  @Prop()
  @ApiProperty({
    description: '用户名'
  })
  readonly username: string

  @Prop()
  @ApiProperty({
    description: '密码',
    example: '123456'
  })
  readonly password: string

  @Prop()
  @ApiProperty({
    description: '头像'
  })
  readonly avatar: string

  @Prop()
  @ApiProperty({
    description: '角色'
  })
  readonly roles: Role[]

  @Prop()
  @ApiProperty({
    description: '手机号'
  })
  readonly phone: string

  @Prop()
  @ApiProperty({
    description: '邮箱'
  })
  readonly email: string

  @Prop()
  @ApiProperty({
    description: '账户ID'
  })
  readonly accountId: string

  @Prop()
  @ApiProperty({
    description: '注册日期',
    example: '2023-09-26 22:24:36'
  })
  readonly registrationDate: string

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
    description: '授权'
  })
  readonly certification: number
}

@Schema()
export class UserSignUp extends PickType(UserEntity, ['username', 'password']) {
  @Prop()
  @ApiProperty({
    description: '用户名'
  })
  // @IsNotEmpty({
  //   message: '用户名不能为空'
  // })
  readonly username: string

  @Prop()
  @ApiProperty({
    description: '用户密码',
    example: '123456'
  })
  // @IsNotEmpty({
  //   message: '密码不能为空'
  // })
  // @MinLength(6, {
  //   message: '密码长度最少为 6 位'
  // })
  readonly password: string
}

export interface UserEntityDTO {
  username: string

  password: string

  avatar: string

  email: string

  job: string

  jobName: string

  organization: string

  organizationName: string

  location: string

  locationName: string

  introduction: string

  personalWebsite: string

  phone: string

  registrationDate: string

  accountId: string

  certification: number

  roles: Role[]
}

export const DefaultUserEntity: UserEntityDTO = {
  username: '',

  password: '',

  avatar: '',

  email: '',

  job: '',

  jobName: '',

  organization: '',

  organizationName: '',

  location: '',

  locationName: '',

  introduction: '',

  personalWebsite: '',

  phone: '',

  registrationDate: '',

  accountId: '',

  certification: 0,

  roles: [Role.User]
}
