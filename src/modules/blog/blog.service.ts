import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { LoggerService } from '@/modules/logger/logger.service'
import { ApiResponse } from '@/interface/response.interface'
import { BlogEntity } from './dto/blog.dto'
import { UserEntity } from '../user/dto/user.dto'

@Injectable()
export class BlogService {
  private response: ApiResponse

  constructor(
    @InjectModel(BlogEntity.name) private blogModel: Model<BlogEntity>,
    private readonly logger: LoggerService
  ) {}

  async createBlogs(blogs: BlogEntity[]) {
    try {
      const res = await this.blogModel.create(blogs)
      console.log(res)
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

  async findBlogs(user: UserEntity, query: string) {
    const pattern = new RegExp(query, 'gi')

    try {
      const res = await this.blogModel
        .aggregate([
          {
            $match: {
              title: {
                $regex: pattern
              },
              uploader: user.username
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

  async findBlogById(user: UserEntity, blogId: string) {
    try {
      const res = await this.blogModel.findOne(
        {
          uploader: user.username,
          _id: blogId
        },
        { _id: 0, __v: 0 }
      )

      console.log(res)
      this.logger.info('BlogService', `${user.username}查询《${res.title || ''}》成功`)
      this.response = {
        Code: 1,
        Message: '博客内容查询成功',
        ReturnData: res
      }
    } catch (err) {
      console.log(err)
      this.logger.info('BlogService', `${user.username}查询博客内容失败`)
      this.response = {
        Code: -1,
        Message: '博客内容查询失败',
        ReturnData: null
      }
    }

    return this.response
  }
}
