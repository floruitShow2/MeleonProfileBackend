import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CommentEntity } from './DTO/comment.dto'
import { CommentService } from './comment.service'
import { CommentController } from './comment.controller'
import { CommentSchema, UserSchema } from '../mongo/schema'
import { UserEntity } from '../user/DTO/user.dto'

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
