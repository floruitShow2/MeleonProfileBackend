import { BadRequestException, Body, Controller, Get, Post, Req } from '@nestjs/common'
import type { Request } from 'express'
import { MessageService } from './message.service'
import { CreateMessageInput } from './dto/message.dto'

@Controller('/message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/getMessageList')
  async getMessageList(@Req() req: Request) {
    const userInfo = req.user
    if (!userInfo) return new BadRequestException('no userId')
    return await this.messageService.getMessageList(userInfo.userId)
  }

  @Post('/createMessage')
  async createMessage(@Body() message: CreateMessageInput) {
    return await this.messageService.createMessage(message)
  }
}
