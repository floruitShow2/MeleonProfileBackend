import { Body, Controller, Post, Req, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { ChunkOptions, MergeOptions, VerifyOptions } from './DTO/file.dto'
import { FileService } from './file.service'

@Controller('file')
export class FileController {
  
  constructor(private readonly fileService: FileService) {}

  @Post('/verify')
  handleVerify(@Req() req: Request, @Body() verifyOptions: VerifyOptions) {
    return this.fileService.handleVerify(req['user'], verifyOptions)
  }

  @Post('/uploadFileChunk')
  @UseInterceptors(FileInterceptor('chunk'))
  handleFileSlice(@Req() req: Request, @UploadedFile() chunk: Express.Multer.File, @Body() chunkOptions: ChunkOptions) {
    return this.fileService.handleChunkUpload(req['user'], chunk, chunkOptions)
  }

  @Post('/merge')
  handleMerge(@Req() req: Request, @Body() mergeOptions: MergeOptions) {
    return this.fileService.handleMerge(req['user'], mergeOptions)
  }
}
