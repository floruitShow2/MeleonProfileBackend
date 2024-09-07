import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { CreateQuestionInput, QuestionEntity } from './dto/question.dto'
import mongoose, { Model } from 'mongoose'
import { getSuccessResponse } from '@/utils/service/response'

@Injectable()
export class QuestionService {
  constructor(@InjectModel(QuestionEntity.name) private questionModel: Model<QuestionEntity>) {}

  async findQuestion(id: mongoose.Types.ObjectId) {
    try {
      const res = await this.questionModel.aggregate([
        {
          $match: {
            _id: id
          }
        },
        {
          $lookup: {
            localField: 'createBy',
            from: 'users',
            foreignField: '_id',
            as: 'createBy'
          }
        },
        {
          $unwind: '$createBy'
        },
        {
          $addFields: {
            id: {
              $toString: '$_id'
            },
            'createBy.userId': {
              $toString: '$createBy._id'
            }
          }
        },
        {
          $project: {
            id: 1,
            title: 1,
            content: 1,
            category: 1,
            files: 1,
            'createBy.userId': 1,
            'createBy.username': 1
          }
        },
        {
          $project: {
            _id: 0,
            __v: 0
          }
        }
      ])
      return getSuccessResponse('查询成功', res[0])
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
  /**
   * @description 创建新的问题
   * @param userId 用户id
   * @param input 问题实体
   * @returns
   */
  async createQuestion(userId: string, input: CreateQuestionInput) {
    try {
      const res = await this.questionModel.create({
        ...input,
        createBy: new mongoose.Types.ObjectId(userId)
      })
      const question = await res.save()
      return this.findQuestion(question._id)
    } catch (err) {
      return new InternalServerErrorException(err.message)
    }
  }
}
