import { Controller, Post, Get, Req, Res, Body, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { join } from 'path'
import { BlogEntity } from '@/interface/blog.interface'
import { formatToDateTime } from '@/utils/time'
import { BlogService } from './blog.service'
import type { Response } from 'express'
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger'

@Controller('blog')
@ApiTags('BlogEntity')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Post('uploadBlogs')
  @ApiOperation({
    summary: '上传博客接口'
  })
  @ApiBody({ type: [BlogEntity] })
  async uploadBlogs(@Req() req: Request, @Body() blogEntities: { blogs: BlogEntity[] }) {
    const { username } = req['user']
    const blogs: BlogEntity[] = blogEntities.blogs.map((blog) => {
      blog.publisher = username
      blog.publishTime = formatToDateTime(new Date())
      return blog
    })
    return await this.blogService.createBlogs(blogs)
  }

  @Get('getStreamFile')
  getFile(@Res({ passthrough: true }) res: Response): StreamableFile {
    console.log(process.cwd())
    const file = createReadStream(join(process.cwd(), '/public/avatar/avatar_1.png'))
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="avatar_1.png"'
    })
    return new StreamableFile(file)
  }
}
