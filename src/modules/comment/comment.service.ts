import { Injectable } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { ApiResponse } from '@/interface/response.interface'
import { LoggerService } from '@/modules/logger/logger.service'
import { CommentEntity } from './dto/comment.dto'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { InjectModel } from '@nestjs/mongoose'
import { formatToDateTime } from '@/utils/time'
import { FlattenArray } from '@/utils/format'
import { UserTokenEntity } from '../user/dto/user.dto'

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
      this.logger.info('/comment/createComment', '评论发布成功')
      this.response = getSuccessResponse('评论发布成功', res)
    } catch (error) {
      this.logger.error('/comment/createComment', error)
      this.response = getFailResponse(null, '评论发布失败')
    }
    return this.response
  }

  async removeCommentById(user: { userId: string }, commentId: string) {
    try {
      // this.commentModel.find({ _id: commentId, publisher: user.userId })
      await this.commentModel.deleteMany({
        publisher: user.userId,
        $or: [{ _id: commentId }, { replyId: commentId }]
      })
      this.logger.info('/comment/removeComment', `删除 id 及 replyId 为${commentId}的评论成功`)
      this.response = getSuccessResponse('删除成功', commentId)
    } catch (error) {
      this.logger.info('/comment/removeComment', `删除 id 及 replyId 为${commentId}的评论失败`)
      this.response = getFailResponse('删除失败', null)
    }

    return this.response
  }

  async getCommentsCount(targetId: string) {
    return await this.commentModel.find({ targetId }).count()
  }

  async getCommentsById(user: UserTokenEntity, targetId: string) {
    try {
      const res = await this.commentModel.aggregate([
        {
          $match: { targetId }
        },
        {
          $addFields: {
            userId: { $toObjectId: '$publisher' },
            commentId: { $toString: '$_id' }
          }
        },
        {
          $addFields: {
            alreadyLike: {
              $in: ['$userId', '$likes.user']
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            foreignField: '_id',
            localField: 'userId',
            as: 'userDetails'
          }
        },
        {
          $unwind: {
            path: '$userDetails'
          }
        },
        {
          $project: {
            commentId: 1,
            targetId: 1,
            replyId: 1,
            publishTime: 1,
            content: 1,
            likes: { $size: '$likes' },
            alreadyLike: 1,
            publisher: {
              username: '$userDetails.username',
              avatar: '$userDetails.avatar'
            },
            _id: 0
          }
        }
      ])

      let result: any[] = []
      const map = {}
      for (const item of res) {
        map[item.commentId] = { ...item, replies: [] }
      }

      for (const item of res) {
        if (item.replyId) {
          map[item.replyId].replies.push({
            ...map[item.commentId],
            replyUser: map[item.replyId].publisher.username
          })
        } else {
          result.push(map[item.commentId])
        }
      }

      result = result.map((item) => {
        item.replies = FlattenArray(item.replies, 'replies')
        return item
      })

      this.logger.info(
        '/comment/getCommentsById',
        `${user.username}查询id为${targetId}的评论时成功`
      )
      this.response = getSuccessResponse('评论列表获取成功', result)
    } catch (error) {
      this.logger.error(
        '/comment/getCommentsById',
        `${user.username}查询id为${targetId}的评论时失败，失败原因：${error}`
      )
      this.response = getFailResponse('评论列表获取失败', null)
    }

    return this.response
  }

  async addCommentLikes(user: UserTokenEntity, commentId: string, type: 'add' | 'sub') {
    const { userId, username } = user
    try {
      await this.commentModel.updateOne(
        { _id: commentId },
        type === 'add'
          ? { $push: { likes: { user: userId, time: formatToDateTime(new Date()) } } }
          : { $pull: { likes: { user: userId } } }
      )
      this.logger.info('/comment/addLikes', `${username}评论${commentId} 点赞数 +1`)
      this.response = getSuccessResponse('点赞成功', null)
    } catch (error) {
      this.logger.error('/comment/addLikes', `${username}评论${commentId}点赞失败`)
      this.response = getFailResponse('点赞失败', null)
    }
    return this.response
  }
}
