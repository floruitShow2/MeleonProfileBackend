import { BadRequestException, Body, Controller, Get, Post, Query, Req } from '@nestjs/common'
import { QuestionService } from './question.service'
import { CreateQuestionInput } from './dto/question.dto'
import mongoose from 'mongoose'

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('/getQuestionById')
  async getQuestionById(@Query('id') id: string) {
    if (!id) return new BadRequestException('消息id不能为空')
    return await this.questionService.findQuestion(new mongoose.Types.ObjectId(id))
  }

  @Post('create')
  async createQuestion(@Req() req: Request, @Body() input: CreateQuestionInput) {
    return await this.questionService.createQuestion(req['user'].userId, input)
  }

  @Post('/getList')
  async getQuestions() {}
}
