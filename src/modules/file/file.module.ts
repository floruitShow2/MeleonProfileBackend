import { Module } from '@nestjs/common'
import { OssService } from '@/modules/oss/oss.service'
import { FileController } from './file.controller'
import { FileService } from './file.service'

@Module({
  controllers: [FileController],
  providers: [FileService, OssService]
})
export class FileModule {}
