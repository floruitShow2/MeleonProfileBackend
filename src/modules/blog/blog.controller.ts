import { Controller, Post, Get, Req, Res, Body, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { join } from 'path'
import { Blog } from '@/interface/blog.interface'
import { formatToDateTime } from '@/utils/time'
import { BlogService } from './blog.service'
import type { Response } from 'express'

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Post('uploadBlogs')
  async uploadBlogs(@Req() req: Request, @Body() blogEntities: { blogs: Blog[] }) {
    const { username } = req['user']
    const blogs: Blog[] = blogEntities.blogs.map((blog) => {
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
