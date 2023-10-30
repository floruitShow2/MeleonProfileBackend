import { SchemaFactory } from '@nestjs/mongoose'
import { UserEntity } from '@/modules/user/dto/user.dto'

export const UserSchema = SchemaFactory.createForClass(UserEntity)
