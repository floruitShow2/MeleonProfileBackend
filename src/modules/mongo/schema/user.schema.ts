import { SchemaFactory } from '@nestjs/mongoose'
import { UserEntity } from '@/modules/user/DTO/user.dto'

export const UserSchema = SchemaFactory.createForClass(UserEntity)
