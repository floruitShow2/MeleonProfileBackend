import { Controller, Post, Get, Req, Body, Query, Param } from '@nestjs/common'
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger'
import { formatToDateTime } from '@/utils/time'
import { BlogService } from './blog.service'
import { BlogEntity, CreateBlogDto } from './dto/blog.dto'

@Controller('blog')
@ApiTags('Blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}

  // @Get('getBlogsInfo')
  // @ApiOperation({
  //   summary: '获取统计数据'
  // })
  // async getBlogsInfo(@Req() req: Request) {}

  @Post('uploadBlogs')
  @ApiOperation({
    summary: '上传博客接口'
  })
  @ApiBody({ type: [BlogEntity] })
  async uploadBlogs(@Req() req: Request, @Body() blogEntities: CreateBlogDto) {
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

  /**
   * @description 根据查询条件搜索博客列表
   * @param {
   *  category: '分类',
   *  sort: '排序指标'
   * }
   */
  // getBlogsByOptions(@Req() req: Request, @Query() query) {}

  @Post('like')
  @ApiOperation({
    summary: '点赞博客'
  })
  handleBlogLike(@Req() req: Request, @Body('blogId') blogId: string) {
    return this.blogService.handleBlogLike(req['user'], blogId)
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
