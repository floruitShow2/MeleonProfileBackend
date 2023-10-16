import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'

@WebSocketGateway(3001, { transports: ['websocket'] })
export class EventsGateway {
  @SubscribeMessage('message')
  handleMessage(@MessageBody('message') message: string) {
    // console.log(client, payload)
    // client.emit('events', {
    //   data: null,
    //   message: `Servier has received ${payload} and return you hello world！`
    // })
    console.log(message)
    return `Servier has received ${message} and return you hello world！`
  }
}
