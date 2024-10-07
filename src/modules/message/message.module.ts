import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MessageSchema } from '../mongo/schema'
import { MessageEntity } from './dto/message.dto'
import { MessageController } from './message.controller'
import { MessageService } from './message.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MessageEntity.name, schema: MessageSchema, collection: 'messages' }])
  ],
  controllers: [MessageController],
  providers: [MessageService]
})
export class MessageModule {}
