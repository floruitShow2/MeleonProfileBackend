import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserEntity } from '@/modules/user/dto/user.dto'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'
import { CommentEntity } from './dto/comment.dto'
import { CommentSchema, UserSchema } from '@/modules/mongo/schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CommentEntity.name,
        schema: CommentSchema,
        collection: 'comments'
      },
      { name: UserEntity.name, schema: UserSchema, collection: 'users' }
    ])
  ],
  controllers: [CommentController],
  providers: [CommentService]
})
export class CommentModule {}
