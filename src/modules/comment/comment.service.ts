import { Injectable } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { ApiResponse } from '@/interface/response.interface'
import { LoggerService } from '@/modules/logger/logger.service'
import { CommentEntity } from './dto/comment.dto'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { InjectModel } from '@nestjs/mongoose'
import { formatToDateTime } from '@/utils/time'
import { FlattenArray } from '@/utils/format'

@Injectable()
export class CommentService {
  private response: ApiResponse

  constructor(
    @InjectModel(CommentEntity.name) private commentModel: Model<CommentEntity>,
    private logger: LoggerService
  ) {}

  async createComment(comment: CommentEntity) {
    try {
      const res = await this.commentModel.create(comment)
      await res.save()
      this.logger.info(null, '评论发布成功')
      this.response = getSuccessResponse('评论发布成功', res)
    } catch (error) {
      this.logger.error(null, error)
      this.response = getFailResponse(null, '评论发布失败')
    }
    return this.response
  }

  async getCommentsCount(targetId: string) {
    return await this.commentModel.find({ targetId }).count()
  }

  async getCommentsById(userId: string, targetId: string) {
    try {
      const res = await this.commentModel
        .find({ targetId }, { __v: 0 })
        .populate('publisher', 'avatar username -_id')
        .exec()
      let result: any[] = []
      const map = {}
      for (const item of res) {
        const itemObj = item.toObject()
        itemObj.commentId = itemObj._id.toString()
        delete itemObj._id

        const likes = itemObj.likes.length
        const findIdx = itemObj.likes.findIndex(
          (item) => (item.user as unknown as Types.ObjectId).toString() === userId
        )
        const alreadyLike = findIdx !== -1
        delete itemObj.likes

        map[itemObj.commentId] = { ...itemObj, likes, alreadyLike, replies: [] }
      }

      for (const item of res) {
        if (item.replyId) {
          map[item.replyId].replies.push({
            ...map[item._id],
            replyUser: map[item.replyId].publisher.username
          })
        } else {
          result.push(map[item._id])
        }
      }

      result = result.map((item) => {
        item.replies = FlattenArray(item.replies, 'replies')
        return item
      })

      this.logger.info(null, `用户查询id为${targetId}的评论时成功`)
      this.response = getSuccessResponse('评论列表获取成功', result)
    } catch (error) {
      console.log(error)
      this.logger.error(null, `用户查询id为${targetId}的评论时失败，失败原因：${error}`)
      this.response = getFailResponse('评论列表获取失败', null)
    }

    return this.response
  }

  async addCommentLikes(userId: string, commentId: string, type: 'add' | 'sub') {
    try {
      await this.commentModel.updateOne(
        { _id: commentId },
        type === 'add'
          ? { $push: { likes: { user: userId, time: formatToDateTime(new Date()) } } }
          : { $pull: { likes: { user: userId } } }
      )
      this.logger.info(null, `评论${commentId} 点赞数 +1`)
      this.response = getSuccessResponse('点赞成功', null)
    } catch (error) {
      this.logger.error(null, `评论${commentId}点赞失败`)
      this.response = getFailResponse('点赞失败', null)
    }
    return this.response
  }
}
