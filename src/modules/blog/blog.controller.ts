import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  Body,
  StreamableFile,
  Query,
  Param,
  UnauthorizedException
} from '@nestjs/common'
import { BlogEntity } from './dto/blog.dto'
import { formatToDateTime } from '@/utils/time'
import { BlogService } from './blog.service'
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
    const { userId } = req['user']
    const blogs: BlogEntity[] = blogEntities.blogs.map((blog) => {
      blog.views = 0
      blog.likes = []
      blog.uploader = userId
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
    return this.blogService.findBlogs(req['user'], searchQuery)
  }
  
  @Post('like')
  @ApiOperation({
    summary: '点赞博客'
  })
  handleBlogLike(@Req() req: Request, @Body('blogId') blogId: string) {
    const user = req['user']
    if (!user) throw new UnauthorizedException()
    return this.blogService.handleBlogLike(user.userId, blogId)
  }

  @Get('getDraftsList')
  @ApiOperation({
    summary: '获取不同状态的草稿列表',
    description: '开发中'
  })
  async getDraftsList(@Req() req: Request, @Query() searchQuery: string) {
    console.log(req['user'], searchQuery)
  }

  @Get(':id')
  @ApiOperation({
    summary: '根据博客ID查找博客相关信息'
  })
  async getBlogById(@Req() req: Request, @Param('id') id: string) {
    return await this.blogService.findBlogById(req['user'], id)
  }
}
