import { SchemaFactory } from '@nestjs/mongoose'
import { CommentEntity } from '@/modules/comment/DTO/comment.dto'

export const CommentSchema = SchemaFactory.createForClass(CommentEntity)
