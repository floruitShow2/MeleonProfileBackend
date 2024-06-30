import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { LoggerService } from '@/modules/logger/logger.service'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { formatToDateTime } from '@/utils/time'
import { UserEntity } from '@/modules/user/dto/user.dto'
import { BlogEntity } from './dto/blog.dto'
import type { ApiResponse } from '@/interface/response.interface'
import type { UserTokenEntity } from '@/modules/user/dto/user.dto'
@Injectable()
export class BlogService {
  private response: ApiResponse

  constructor(
    @InjectModel(BlogEntity.name) private blogModel: Model<BlogEntity>,
    private readonly logger: LoggerService
  ) {}

  // utils
  /**
   * @description 统计给定用户发布的所有文章的统计数据
   * @param userId
   */
  async getBlogsStatistics(userId: string) {
    const res = await this.blogModel.aggregate([
      {
        $match: { uploader: userId }
      },
      {
        $addFields: {
          blogId: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'comments',
          foreignField: 'targetId',
          localField: 'blogId',
          as: 'comments'
        }
      },
      {
        $project: {
          likes: { $size: '$likes' },
          comments: { $size: '$comments' },
          views: 1
        }
      }
    ])

    // 文章数、阅读数、点赞数
    const statistic = {
      blogCount: 0,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0
    }

    res.forEach((item) => {
      statistic.blogCount += 1
      statistic.viewCount += item.views
      statistic.likeCount += item.likes
      statistic.commentCount += item.comments
    })

    return statistic
  }

  // services
  async getBlogsInfo(user: UserTokenEntity) {
    this.blogModel.aggregate([
      {
        $match: { uploader: { $toObjectId: user.userId } }
      }
    ])
  }

  async createBlogs(blogs: BlogEntity[]) {
    try {
      const result = await this.blogModel.create(blogs)
      this.response = getSuccessResponse(
        '博客文件上传成功',
        result.map((item) => item.title)
      )
      this.logger.info('/blog/uploadBlogs', '上传博客文件成功')
    } catch {
      this.response = getFailResponse('博客文件上传失败', null)
      this.logger.error('/blog/uploadBlogs', '上传博客文件失败')
    }

    return this.response
  }

  /**
   * @description 获取博客列表
   * @param user 从 userToken 中解析出来的用户信息
   * @param query 查询条件
   * @returns 博客列表，不包括 content 等无需直接展示的数据
   */
  async findBlogs(user: UserTokenEntity, query: string) {
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
              blogId: { $toString: '$_id' }
            }
          },
          {
            $lookup: {
              from: 'comments',
              foreignField: 'targetId',
              localField: 'blogId',
              as: 'comments'
            }
          },
          {
            $project: {
              blogId: 1,
              title: 1,
              description: 1,
              status: 1,
              uploadTime: 1,
              views: 1,
              likes: { $size: '$likes' },
              comments: { $size: '$comments' }
            }
          },
          {
            $project: {
              _id: 0
            }
          }
        ])
        .exec()

      this.response = getSuccessResponse('查询文章列表成功', res)
      this.logger.info('/blog/getBlogsList', `${user.userId}查询文章列表操作成功`)
    } catch (err) {
      this.response = getFailResponse('查询文章列表失败', null)
      this.logger.error('/blog/getBlogsList', `${user.userId}查询文章列表操作失败`)
    }

    return this.response
  }

  /**
   * @description 根据博客ID查询单篇博客的文章详情
   * @param user 从 userToken 中解析出来的用户信息
   * @param blogId 博客ID
   * @returns 单篇博客的详细信息，包括部分发布者信息
   */
  async findBlogById(user: UserTokenEntity, blogId: string) {
    const { userId } = user
    try {
      const res = await this.blogModel
        .aggregate([
          {
            $match: { _id: new mongoose.Types.ObjectId(blogId) }
          },
          {
            $addFields: {
              blogId: { $toString: '$_id' },
              // uploader 是 stirng 类型， _id 是 ObjectId 类型，$lookup 无法匹配二者，需要提前进行转换
              uploader: { $toObjectId: '$uploader' },
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
              localField: 'uploader',
              as: 'uploaders'
            }
          },
          {
            $lookup: {
              from: 'comments',
              foreignField: 'targetId',
              localField: 'blogId',
              as: 'comments'
            }
          },
          {
            $addFields: {
              'uploaders.userId': { $toString: '$_id' }
            }
          },
          {
            $project: {
              'uploaders._id': 0,
              'uploaders.__v': 0,
              'uploaders.password': 0,
              'uploaders.role': 0,
              'uploaders.salt': 0,
              'uploaders.phone': 0,
              'uploaders.certification': 0,
              'uploaders.socialAccounts': 0,
              'uploaders.location': 0,
              'uploaders.registrationDate': 0
            }
          },
          {
            $project: {
              blogId: 1,
              uploader: {
                $arrayElemAt: ['$uploaders', 0]
              },
              content: 1,
              liked: 1,
              title: 1,
              uploadTime: 1,
              views: 1,
              tags: 1,
              status: 1,
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
              _id: 0
            }
          }
        ])
        .exec()

      if (res && res.length) {
        // 文章阅读数加一
        const blogEntity = res[0] as BlogEntity
        await this.blogModel.updateOne(
          {
            _id: blogEntity.blogId
          },
          { $set: { views: blogEntity.views + 1 } }
        )

        const { uploader, ...rest } = blogEntity
        // 返回值中的 views 字段值 +1
        rest.views++
        const statistics = await this.getBlogsStatistics(user.userId)

        this.response = getSuccessResponse('博客内容查询成功', {
          articleInfo: rest,
          authorInfo: {
            ...(uploader as unknown as UserEntity),
            ...statistics
          }
        })
        this.logger.info('/blog/:id', `${userId}查询《${res[0].title || ''}》成功`)
      } else {
        this.response = getFailResponse('未查询到该博客内容', null)
        this.logger.info('/blog/:id', `${userId}查询《${res[0].title || ''}》失败`)
      }
    } catch (err) {
      this.response = getFailResponse('博客内容查询失败', null)
      this.logger.info('/blog/:id', `${userId}查询博客内容失败`)
    }

    return this.response
  }

  /**
   * @description 点赞博客
   * @param user从 userToken 中解析出来的用户信息
   * @param blogId 博客ID
   * @returns
   */
  async handleBlogLike(user: UserTokenEntity, blogId: string) {
    const { userId } = user
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

      this.response = getSuccessResponse(isLiked ? '取消点赞成功' : '评论点赞数 +1', 'BlogService')
      this.logger.info('/blog/like', isLiked ? '取消点赞成功' : '评论点赞数 +1')
    } catch (err) {
      this.response = getFailResponse(isLiked ? '取消点赞失败' : '点赞评论失败', 'BlogService')
      this.logger.error('/blog/like', isLiked ? '取消点赞失败' : '点赞评论失败')
    }

    return this.response
  }
}
