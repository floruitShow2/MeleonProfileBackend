import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatMessageSchema } from '@/modules/mongo/schema/chat.schema'
import { ChatMessageService } from './chat-message.service'
import { ChatMessageController } from './chat-message.controller'
import { ChatMessageGateway } from './chat-message.gateway'
import { ChatMessageEntity } from './dto/chat-message.dto'
import { ChatRoomModule } from '../chat-room/chat-room.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessageEntity.name, schema: ChatMessageSchema, collection: 'chatMessages' }
    ]),
    ChatRoomModule,
    UserModule
  ],
  providers: [ChatMessageGateway, ChatMessageService],
  controllers: [ChatMessageController]
})
export class ChatMessageModule {}
