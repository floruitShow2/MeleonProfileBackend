import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { LoggerService } from '@/modules/logger/logger.service'
import { ApiResponse } from '@/interface/response.interface'
import { BlogEntity } from './dto/blog.dto'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { formatToDateTime } from '@/utils/time'

@Injectable()
export class BlogService {
  private response: ApiResponse

  constructor(
    @InjectModel(BlogEntity.name) private blogModel: Model<BlogEntity>,
    private readonly logger: LoggerService
  ) {}

  async createBlogs(blogs: BlogEntity[]) {
    try {
      await this.blogModel.create(blogs)
      this.logger.info(null, '上传博客文件成功')
      this.response = {
        Code: 1,
        Message: '博客文件上传成功',
        ReturnData: '博客文件上传成功'
      }
    } catch {
      this.logger.error(null, '上传博客文件失败')
      this.response = {
        Code: -1,
        Message: '博客文件上传失败',
        ReturnData: null
      }
    }

    return this.response
  }

  async findBlogs(user: { username: string; userId: string }, query: string) {
    const pattern = new RegExp(query, 'gi')

    try {
      const res = await this.blogModel
        .aggregate([
          {
            $match: {
              title: {
                $regex: pattern
              },
              uploader: user.userId
            }
          },
          {
            $addFields: {
              id: { $toString: '$_id' }
            }
          },
          {
            $project: {
              tags: 0,
              content: 0,
              __v: 0,
              _id: 0
            }
          }
        ])
        .exec()

      this.logger.info(null, `${user.username}查询文章列表操作成功`)
      this.response = {
        Code: 1,
        Message: '查询文章列表成功',
        ReturnData: res
      }
    } catch (err) {
      this.logger.error(null, `${user.username}查询文章列表操作失败`)
      this.response = {
        Code: 1,
        Message: '查询文章列表失败',
        ReturnData: null
      }
    }

    return this.response
  }

  async findBlogById(user: { username: string; userId: string }, blogId: string) {
    const { username, userId } = user
    try {
      const res = await this.blogModel
        .aggregate([
          {
            $match: {
              $or: [{ uploader: userId }, { _id: blogId }]
            }
          },
          {
            $addFields: {
              uid: { $toObjectId: '$uploader' },
              id: { $toString: '$_id' },
              liked: {
                $cond: {
                  if: {
                    $ne: [
                      {
                        $size: {
                          $filter: {
                            input: '$likes',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.userId', userId]
                            }
                          }
                        }
                      },
                      0
                    ]
                  },
                  then: true,
                  else: false
                }
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              foreignField: '_id',
              localField: 'uid',
              as: 'uploaders'
            }
          },
          {
            $lookup: {
              from: 'comments',
              foreignField: 'targetId',
              localField: 'id',
              as: 'comments'
            }
          },
          {
            $project: {
              'uploaders._id': 0,
              'uploaders.__v': 0,
              'uploaders.password': 0,
              'uploaders.roles': 0
            }
          },
          {
            $project: {
              id: 1,
              uploader: {
                $arrayElemAt: ['$uploaders', 0]
              },
              content: 1,
              liked: 1,
              title: 1,
              uploadTime: 1,
              views: 1,
              tags: 1,
              likes: {
                $size: '$likes'
              },
              comments: {
                $size: '$comments'
              }
            }
          },
          {
            $project: {
              uploaders: 0,
              _id: 0
            }
          }
        ])
        .exec()

      this.logger.info('BlogService', `${username}查询《${res[0].title || ''}》成功`)
      this.response = {
        Code: 1,
        Message: '博客内容查询成功',
        ReturnData: res[0]
      }
    } catch (err) {
      this.logger.info('BlogService', `${username}查询博客内容失败`)
      this.response = {
        Code: -1,
        Message: '博客内容查询失败',
        ReturnData: null
      }
    }

    return this.response
  }

  async handleBlogLike(userId: string, blogId: string) {
    let isLiked = false
    try {
      // 判断是否已经点赞
      const res = await this.blogModel.findOne({ _id: blogId, 'likes.userId': userId })
      isLiked = res ? true : false
      // 添加或删除点赞记录
      await this.blogModel.updateOne(
        { _id: blogId },
        isLiked
          ? { $pull: { likes: { userId } } }
          : { $push: { likes: { userId, timeStamp: formatToDateTime(new Date()) } } }
      )
      this.logger.info('BlogService', isLiked ? '取消点赞成功' : '评论点赞数 +1')
      this.response = getSuccessResponse(isLiked ? '取消点赞成功' : '评论点赞数 +1', 'BlogService')
    } catch (err) {
      this.logger.error('BlogService', isLiked ? '取消点赞失败' : '点赞评论失败')
      this.response = getFailResponse(isLiked ? '取消点赞失败' : '点赞评论失败', 'BlogService')
    }

    return this.response
  }
}
