import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway
} from '@nestjs/websockets'
import { Socket } from 'dgram'
import { from } from 'rxjs'
import { map } from 'rxjs/operators'

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class EventsGateway {
  @SubscribeMessage('events')
  findAll(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log(data)
    return from([1, 2, 3]).pipe(
      map((item) => {
        client.emit('onEvents', { event: 'events', originData: data, data: item })
      })
    )
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data
  }
}
