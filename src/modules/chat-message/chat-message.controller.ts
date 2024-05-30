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
import { genStoragePath } from '@/utils/format'
import { ChatMessagePagingInput } from './dto/chat-message.dto'
import { ChatMessageService } from './chat-message.service'

@Controller('/chat/message')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

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
          cb(null, res.originalname)
        }
      })
    })
  )
  uploadFile(
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('roomId') roomId: string
  ) {
    return this.chatMessageService.createFileMessage(roomId, req.user.userId, files)
  }
}
