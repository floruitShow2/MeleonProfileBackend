import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatRoomSchema } from '@/modules/mongo/schema/chat.scehma'
import { UserModule } from '@/modules/user/user.module'
import { ChatRoomService } from './chat-room.service'
import { ChatRoomController } from './chat-room.controller'
import { ChatRoomEntity } from './dto/chat-room.dto'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoomEntity.name, schema: ChatRoomSchema, collection: 'chatRooms' }
    ]),
    UserModule
  ],
  providers: [ChatRoomService],
  controllers: [ChatRoomController],
  exports: [ChatRoomService]
})
export class ChatRoomModule {}
