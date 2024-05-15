import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatMessageService } from './chat-message.service'
import { ChatMessageController } from './chat-message.controller'
import { ChatMessageEntity } from './dto/chat-message.dto'
import { ChatMessageSchema } from '../mongo/schema/chat.scehma'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessageEntity.name, schema: ChatMessageSchema, collection: 'chatMessages' }
    ])
  ],
  providers: [ChatMessageService],
  controllers: [ChatMessageController]
})
export class ChatMessageModule {}
