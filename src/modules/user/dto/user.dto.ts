import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsNotEmpty, MinLength } from 'class-validator'
import { Document } from 'mongoose'
import { Role } from '@/constants/auth'

@Schema()
export class UserEntity extends Document {
  userId: string
  
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
    description: '密码',
    example: '123456'
  })
  @IsNotEmpty({
    message: '密码不能为空'
  })
  @MinLength(6, {
    message: '密码长度最少为 6 位'
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
  readonly role: Role

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
export class UserSignUpInput extends PickType(UserEntity, ['username', 'password']) {}
