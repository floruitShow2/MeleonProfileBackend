import { Body, Controller, Post, Req } from '@nestjs/common'
import type { VerifyOptions } from './dto/file.dto'

@Controller('file')
export class FileController {
  @Post('/verify')
  handleVerify(@Req() req: Request, @Body() verifyOptions: VerifyOptions) {
    return 'verify'
  }
}
