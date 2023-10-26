import { SchemaFactory } from '@nestjs/mongoose'
import { UserEntity } from '@/interface/user.interface'

export const UserSchema = SchemaFactory.createForClass(UserEntity)
