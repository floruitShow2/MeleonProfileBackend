import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChatMessageEntity, ChatMessageInput } from './dto/chat-message.dto'
import { SocketOnEvents, SocketEmitEvents } from './events/chat-message.events'
import { ChatMessageService } from './chat-message.service'

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class ChatMessageGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server

  constructor(private readonly chatMessageService: ChatMessageService) {}

  handleConnection(client: Socket) {
    const roomId = client.handshake.query.roomId
    client.join(roomId)
  }

  broadcastMessage(roomId: string, newMessage: ChatMessageEntity) {
    this.server.to(roomId).emit(SocketOnEvents.MSG_CREATE, newMessage)
  }

  @SubscribeMessage(SocketEmitEvents.CREATE_MESSAGE)
  async handleCreateMessage(
    @MessageBody() data: ChatMessageInput,
    @ConnectedSocket() client: Socket
  ) {
    const newMessage = await this.chatMessageService.createMessage(data)
    this.broadcastMessage(data.roomId.toString(), newMessage)
  }
}
