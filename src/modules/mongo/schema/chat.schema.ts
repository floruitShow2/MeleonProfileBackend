import { SchemaFactory } from '@nestjs/mongoose'
import { ChatRoomEntity } from '@/modules/chat-room/dto/chat-room.dto'
import { ChatMessageEntity } from '@/modules/chat-message/dto/chat-message.dto'

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoomEntity)
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessageEntity)
