import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OssService } from '@/modules/oss/oss.service'
import { FileController } from './file.controller'
import { FileService } from './file.service'
import { FileEntity } from './dto/file.dto'
import { FileSchema } from '../mongo/schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileEntity.name, schema: FileSchema, collection: 'files' }])
  ],
  controllers: [FileController],
  providers: [FileService, OssService]
})
export class FileModule {}
