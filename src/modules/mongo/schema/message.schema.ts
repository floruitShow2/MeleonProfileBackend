import { SchemaFactory } from '@nestjs/mongoose'
import { MessageEntity } from '@/modules/message/dto/message.dto'

export const MessageSchema = SchemaFactory.createForClass(MessageEntity)
