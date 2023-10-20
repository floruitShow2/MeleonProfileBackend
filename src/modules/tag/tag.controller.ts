import { Controller, Get } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { Tags } from '@/constants/blog/tags'

@Controller('tag')
export class TagController {
  @Get('getBlogTags')
  @ApiOperation({
    summary: '获取文章分类标签'
  })
  getArticlesTag() {
    return {
      Code: 1,
      Message: 'ok',
      ReturnData: Tags
    }
  }
}
