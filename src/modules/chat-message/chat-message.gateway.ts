import { Inject, forwardRef } from '@nestjs/common'
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChatMessageResponseEntity } from './dto/chat-message.dto'
import { SocketOnEvents, SocketEmitEvents } from './events/chat-message.events'
import { ChatMessageService } from './chat-message.service'

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class ChatMessageGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server

  constructor(
    @Inject(forwardRef(() => ChatMessageService))
    private readonly chatMessageService: ChatMessageService
  ) {}

  handleConnection(client: Socket) {
    const roomId = client.handshake.query.roomId
    client.join(roomId)
  }

  broadcastMessage(roomId: string, newMessage: ChatMessageResponseEntity[]) {
    this.server.to(roomId).emit(SocketOnEvents.MSG_CREATE, newMessage)
  }

  broadcastRecallMessage(
    roomId: string,
    recallMesssageId: string,
    recallMessage: ChatMessageResponseEntity[]
  ) {
    this.server.to(roomId).emit(SocketOnEvents.MSG_RECALL, recallMesssageId, recallMessage)
  }

  @SubscribeMessage(SocketEmitEvents.DELETE_MESSAGE)
  async handleDeleteMessage() {}
}
