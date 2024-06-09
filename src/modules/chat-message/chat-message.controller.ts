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
import { ChatMessagePagingInput } from './dto/chat-message.dto'
import { ChatMessageService } from './chat-message.service'
import { ChatMessageGateway } from './chat-message.gateway'

@Controller('/chat/message')
export class ChatMessageController {
  constructor(
    private readonly chatMessageService: ChatMessageService,
    private readonly chatMessageGateway: ChatMessageGateway
  ) {}

  @Get('/getMessagesList')
  findMessagesByPages(@Query() pagingInput: ChatMessagePagingInput) {
    return this.chatMessageService.findMessagesByPages(pagingInput)
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
          console.log(decodedName)
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
    const newMessages = await this.chatMessageService.createFileMessage(roomId, req.user.userId, files)
    this.chatMessageGateway.broadcastMessage(roomId, newMessages)
    return getSuccessResponse('消息已发布', newMessages)
  }
}
