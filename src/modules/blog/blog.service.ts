import { BlogEntity } from '@/interface/blog.interface'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { LoggerService } from '../logger/logger.service'
import { ApiResponse } from '@/interface/response.interface'

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
}
