import { Controller, Get, Query } from '@nestjs/common'
import { ChatMessagePagingInput } from './dto/chat-message.dto'
import { ChatMessageService } from './chat-message.service'

@Controller('/chat/message')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @Get('/getMessagesList')
  findMessagesByPages(@Query() pagingInput: ChatMessagePagingInput) {
    return this.chatMessageService.findMessagesByPages(pagingInput)
  }
}
