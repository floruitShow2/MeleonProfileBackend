import { Module } from '@nestjs/common'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'
import { MongooseModule } from '@nestjs/mongoose'
import { CommentEntity } from './dto/comment.dto'
import { CommentSchema, UserSchema } from '../mongo/schema'
import { UserEntity } from '../user/dto/user.dto'

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
