import { Role } from '@/constants/auth'
import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsNotEmpty, MinLength } from 'class-validator'
import { Document } from 'mongoose'

@Schema()
export class UserEntity extends Document {

  @Prop()
  @ApiProperty({
    description: '用户ID'
  })
  readonly userId: string

  @Prop()
  @ApiProperty({
    description: '用户名',
    example: 'meleon'
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
    description: '简介'
  })
  readonly introduction: string

  @Prop()
  @ApiProperty({
    description: '邮箱'
  })
  readonly email: string

  @Prop()
  @ApiProperty({
    description: '籍贯/居住地'
  })
  readonly location: string

  @Prop()
  @ApiProperty({
    description: '角色'
  })
  readonly roles: Role[]

  @Prop()
  @ApiProperty({
    description: '社交账号链接，github、掘金等'
  })
  readonly socialAccounts: string[]

  @Prop()
  @ApiProperty({
    description: '密码加密盐值'
  })
  salt: string

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
    description: '职业'
  })
  readonly job: string

  @Prop()
  @ApiProperty({
    description: '所属企业/组织'
  })
  readonly organization: string

  @Prop()
  @ApiProperty({
    description: '身份证号'
  })
  readonly certification: string
}

@Schema()
export class UserSignUp extends PickType(UserEntity, ['username', 'password']) {
  @Prop()
  @ApiProperty({
    description: '用户名',
    example: 'meleon'
  })
  @IsNotEmpty({
    message: '用户名不能为空'
  })
  readonly username: string

  @Prop()
  @ApiProperty({
    description: '用户密码',
    example: '232000'
  })
  @IsNotEmpty({
    message: '密码不能为空'
  })
  @MinLength(6, {
    message: '密码长度最少为 6 位'
  })
  password: string
}

export interface UserEntityDTO {
  username: string

  password: string

  avatar: string

  introduction: string

  email: string

  phone: string

  location: string

  roles: Role[]

  socialAccounts: string[]

  job: string

  organization: string

  registrationDate: string

  certification: string

  userId?: string
}

export class UserTokenEntity extends PickType(UserEntity, ['username', 'userId', 'roles']) {}

export const DefaultUserEntity: UserEntityDTO = {
  username: '',

  password: '',

  avatar: '',

  email: '',

  job: '',

  organization: '',

  location: '',

  introduction: '',

  phone: '',

  registrationDate: '',

  certification: '',

  roles: [Role.User],

  socialAccounts: []
}

export interface PasswordsType {
  oldPwd: string
  newPwd: string
  confirmPwd: string
}
