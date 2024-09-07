import { SchemaFactory } from '@nestjs/mongoose'
import { QuestionEntity } from '@/modules/question/dto/question.dto'

export const QuestionSchema = SchemaFactory.createForClass(QuestionEntity)
