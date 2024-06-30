import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import { diskStorage } from 'multer'
import { resolve } from 'path'
import { OssService } from '@/modules/oss/oss.service'
import { FileService } from './file.service'
import type {
  ChunkOptions,
  MergeOptions,
  VerifyOptions,
  GetFrameInput
} from './interface/file.interface'

@Controller('file')
@ApiTags('file')
export class FileController {
  constructor(private readonly fileService: FileService, private readonly ossService: OssService) {}

  @Post('/verify')
  handleVerify(@Req() req: Request, @Body() verifyOptions: VerifyOptions) {
    return this.fileService.handleVerify(req['user'], verifyOptions)
  }

  @Post('/uploadFileChunk')
  @UseInterceptors(FileInterceptor('chunk'))
  handleFileSlice(
    @Req() req: Request,
    @UploadedFile() chunk: Express.Multer.File,
    @Body() chunkOptions: ChunkOptions
  ) {
    return this.fileService.handleChunkUpload(req['user'], chunk, chunkOptions)
  }

  @Post('/merge')
  handleMerge(@Req() req: Request, @Body() mergeOptions: MergeOptions) {
    return this.fileService.handleMerge(req['user'], mergeOptions)
  }

  @Post('/oss/uploadFile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, res, cb) => {
          const storagePath = resolve(
            process.cwd(),
            `/files/${req['user']?.username || 'meleon'}/oss/`
          )
          // if (!existsSync(storagePath)) {
          //   mkdirSync(storagePath, { recursive: true })
          // }
          cb(null, storagePath)
        },
        filename: (req, res, cb) => {
          cb(null, res?.originalname)
        }
      })
    })
  )
  handleTestOSS(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    return this.fileService.uplodaFileToOSS(req['user'], file)
  }

  @Get('/oss/downloadFile')
  handleDownloadFile(@Req() req: Request, @Query('path') path: string) {
    return this.fileService.downloadFileFromOSS(req['user'], path)
  }

  @Get('/video/getFrame')
  getVideoFrame(@Query() queries: GetFrameInput) {
    return this.fileService.getVideoFrame(queries)
  }
}
