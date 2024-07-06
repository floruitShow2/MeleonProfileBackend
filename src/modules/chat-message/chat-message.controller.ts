import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Request } from 'express'
import { diskStorage } from 'multer'
import * as iconv from 'iconv-lite'
import { genStoragePath } from '@/utils/format'
import { getSuccessResponse } from '@/utils/service/response'
import { ChatMessageInput, ChatMessageLocatedInput, ChatMessagePagingInput } from './dto/chat-message.dto'
import { ChatMessageService } from './chat-message.service'
import { ChatMessageGateway } from './chat-message.gateway'

@Controller('/chat/message')
export class ChatMessageController {
  constructor(
    private readonly chatMessageService: ChatMessageService,
    private readonly chatMessageGateway: ChatMessageGateway
  ) {}

  @Post('/createMessage')
  async handleCreateMessage(@Body() chatMessageInput: ChatMessageInput) {
    return await this.chatMessageService.handleCreateMessage(chatMessageInput)
  }

  @Get('/getMessagesList')
  async findMessagesByPages(@Req() req: Request, @Query() pagingInput: ChatMessagePagingInput) {
    return await this.chatMessageService.findMessagesByPages(req.user.userId, pagingInput)
  }

  @Get('/getMessageById')
  async findMessagesById(@Query('messageId') id: string) {
    const res = await this.chatMessageService.findMessageById(id)
    return getSuccessResponse('消息查询成功', res)
  }

  @Get('/getReplyChain')
  async findReplyMessageChain(@Req() req: Request, @Query('messageId') id: string) {
    return await this.chatMessageService.findReplyMessageChain(req['user'].userId, id)
  }

  @Get('/getLocatedPage')
  async findMessageLocatedPage(@Query() query: ChatMessageLocatedInput) {
    return await this.chatMessageService.findMessageLocatedPage(query)
  }

  @Post('/createFileMessage')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: function (req, res, cb) {
          const { diskPath } = genStoragePath(`${req['user'].userId}`)
          cb(null, diskPath)
        },
        filename: function (req, res, cb) {
          const buf = Buffer.from(res.originalname, 'binary')
          const decodedName = iconv.decode(buf, 'utf-8').replace(/[\s%20]+/g, '')
          cb(null, decodedName)
        }
      })
    })
  )
  async uploadFile(
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('roomId') roomId: string
  ) {
    const newMessages = await this.chatMessageService.createFileMessage(
      roomId,
      req.user.userId,
      files
    )
    this.chatMessageGateway.broadcastMessage(roomId, newMessages)
    return getSuccessResponse('消息已发布', newMessages)
  }

  @Post('/recall')
  async recallMessage(@Req() req: Request, @Body('messageId') messageId: string) {
    return await this.chatMessageService.recallMessage(req.user.userId, messageId)
  }

  @Post('/clear')
  async clearRecords(@Req() req: Request, @Body('roomId') roomId: string) {
    return await this.chatMessageService.clearMessagesRecord(req.user.userId, roomId)
  }
}
