import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CommentSchema } from '@/modules/mongo/schema'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'
import { CommentEntity } from './dto/comment.dto'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CommentEntity.name,
        schema: CommentSchema,
        collection: 'comments'
      }
    ])
  ],
  controllers: [CommentController],
  providers: [CommentService]
})
export class CommentModule {}
