import { SchemaFactory } from '@nestjs/mongoose'
import { ChatMessageEntity } from '@/modules/chat-message/dto/chat-message.dto'
import { ChatRoomEntity } from '@/modules/chat-room/dto/chat-room.dto'

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoomEntity)

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessageEntity)
