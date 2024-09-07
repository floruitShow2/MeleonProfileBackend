import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { QuestionService } from './question.service'
import { QuestionController } from './question.controller'
import { QuestionEntity } from './dto/question.dto'
import { QuestionSchema } from '../mongo/schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuestionEntity.name, schema: QuestionSchema, collection: 'questions' }
    ])
  ],
  providers: [QuestionService],
  controllers: [QuestionController]
})
export class QuestionModule {}
