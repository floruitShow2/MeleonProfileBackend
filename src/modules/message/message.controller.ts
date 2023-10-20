import { Controller, Sse } from '@nestjs/common'
import { Observable, interval, map } from 'rxjs'
import { Message } from '@/interface/message.interface'

@Controller('message')
export class MessageController {
  //   @Sse('getMessage')
  //   getSse(): Observable<Message> {
  //     return interval(1000).pipe(map((_) => ({ data: 'hello nestjs', id: '1', type: 'message' })))
  //   }
}
