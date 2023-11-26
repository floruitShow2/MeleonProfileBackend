import { Controller, Post, Get, Req, Res, Body, StreamableFile, Query, Param } from '@nestjs/common'
import { createReadStream } from 'fs'
import { join } from 'path'
import { BlogEntity } from './dto/blog.dto'
import { formatToDateTime } from '@/utils/time'
import { BlogService } from './blog.service'
import type { Response, query } from 'express'
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger'

@Controller('blog')
@ApiTags('Blogs')
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
      blog.views = 0
      blog.likes = 0
      blog.uploader = username
      blog.uploadTime = formatToDateTime(new Date())
      return blog
    })
    return await this.blogService.createBlogs(blogs)
  }

  @Get('getBlogsList')
  @ApiOperation({
    summary: '获取不同状态的博客文章列表'
  })
  async getBlogsList(@Req() req: Request, @Query('searchQuery') searchQuery: string) {
    console.log(searchQuery)
    return this.blogService.findBlogs(req['user'], searchQuery)
  }

  @Get('getDraftsList')
  @ApiOperation({
    summary: '获取不同状态的草稿列表'
  })
  async getDraftsList(@Req() req: Request, @Query() searchQuery: string) {
    console.log(req['user'], searchQuery)
  }

  @Get('getStreamFile')
  getFile(@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(join(process.cwd(), '/public/avatar/avatar_1.png'))
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="avatar_1.png"'
    })
    return new StreamableFile(file)
  }

  @Get(':id')
  @ApiOperation({
    summary: '根据博客ID查找博客相关信息'
  })
  async getBlogById(@Req() req: Request, @Param('id') id: string) {
    console.log(req['user'], id)
    return await this.blogService.findBlogById(req['user'], id)
  }
}
