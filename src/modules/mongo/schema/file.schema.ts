import { SchemaFactory } from '@nestjs/mongoose'
import { FileEntity } from '@/modules/file/dto/file.dto'

export const FileSchema = SchemaFactory.createForClass(FileEntity)
