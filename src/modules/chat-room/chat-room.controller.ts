import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { AuthGuard } from '@/guards/auth.guard'
import { ChatRoomInput, RemoveMemberInput } from './dto/chat-room.dto'
import { ChatRoomService } from './chat-room.service'

@UseGuards(AuthGuard)
@Controller('/chat/room')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post('/createRoom')
  createRoom(@Req() req: Request, @Body() chatRoomInput: ChatRoomInput) {
    return this.chatRoomService.createRoom(req.user, chatRoomInput)
  }

  @Get('/getRooms')
  getRoomsByUserId(@Req() req: Request) {
    return this.chatRoomService.getRoomsByUserId(req.user?.userId)
  }

  @Post('/deleteRoom')
  deleteRoomById(@Req() req: Request, @Body('roomId') roomId: string) {
    return this.chatRoomService.deleteRoom(req.user, roomId)
  }

  @Get('/getInviteCode')
  getInviteCode(@Req() req: Request, @Query('roomId') roomId: string) {
    return this.chatRoomService.generateInviteCode(req.user.userId, roomId)
  }

  @Get('/getDetailsByInviteCode')
  getDetailsByInviteCode(@Query('inviteCode') inviteCode: string) {
    return this.chatRoomService.getDetailsByInviteCode(inviteCode)
  }

  @Post('/inviteMember')
  inviteMember(@Req() req: Request, @Body('inviteCode') inviteCode: string) {
    return this.chatRoomService.inviteMember(req.user, inviteCode)
  }

  @Post('/removeMember')
  removeMember(@Req() req: Request, @Body() data: RemoveMemberInput) {
    return this.chatRoomService.removeMember(req.user, data.roomId, data.userId)
  }

  @Get('/getMembers')
  getMembers(@Query('roomId') roomId: string) {
    return this.chatRoomService.getMembers(roomId)
  }
}
