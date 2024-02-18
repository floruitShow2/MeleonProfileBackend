import { Body, Controller, Post, Req } from '@nestjs/common'
import type { VerifyOptions } from './dto/file.dto'
import { FileService } from './file.service'

@Controller('file')
export class FileController {
  
  constructor(private readonly fileService: FileService) {}

  @Post('/verify')
  handleVerify(@Req() req: Request, @Body() verifyOptions: VerifyOptions) {
    return this.fileService.handleVerify(req['user'], verifyOptions)
  }
}
