import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import type { Request } from 'express'
import { ChatRoomInput } from './dto/chat-room.dto'
import { ChatRoomService } from './chat-room.service'

@Controller('/chat/room')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post('/createRoom')
  createRoom(@Req() req: Request, @Body() chatRoomInput: ChatRoomInput) {
    return this.chatRoomService.createRoom(req.user, chatRoomInput)
  }

  @Get('/getRoomsById')
  getRoomsById(@Req() req: Request) {
    return this.chatRoomService.getRoomsByUserId(req.user?.userId)
  }

  @Post('/deleteRoom')
  deleteRoomById(@Req() req: Request, @Body('roomId') roomId: string) {
    return this.chatRoomService.deleteRoom(req.user, roomId)
  }
}
