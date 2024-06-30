import { Inject, forwardRef } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import {
  ChatMessageEntity,
  ChatMessageInput,
  ChatMessageResponseEntity
} from './dto/chat-message.dto'
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

  /**
   * @description 监听创建消息的事件
   * @param data
   * @param client
   */
  @SubscribeMessage(SocketEmitEvents.CREATE_MESSAGE)
  async handleCreateMessage(
    @MessageBody() data: ChatMessageInput,
    @ConnectedSocket() client: Socket
  ) {
    const newMessage = await this.chatMessageService.createMessage(data)
    this.broadcastMessage(data.roomId.toString(), [newMessage])
  }

  @SubscribeMessage(SocketEmitEvents.DELETE_MESSAGE)
  async handleDeleteMessage() {}
}
