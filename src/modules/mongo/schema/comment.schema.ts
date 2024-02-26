import { SchemaFactory } from '@nestjs/mongoose'
import { CommentEntity } from '@/modules/comment/dto/comment.dto'

export const CommentSchema = SchemaFactory.createForClass(CommentEntity)
