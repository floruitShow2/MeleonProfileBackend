import { Controller, Post, Get, Req, Body, UnauthorizedException, Query } from '@nestjs/common'
import { formatToDateTime } from '@/utils/time'
import { ApiTags } from '@nestjs/swagger'
import { CommentService } from './comment.service'
import { CommentEntity } from './dto/comment.dto'

@Controller('comment')
@ApiTags('Comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/createComment')
  createComment(@Req() req: Request, @Body() comment: CommentEntity) {
    const user = req['user']
    if (!user.userId) return new UnauthorizedException()
    comment.publisher = user.userId
    comment.publishTime = formatToDateTime(new Date())
    return this.commentService.createComment(comment)
  }

  @Post('/removeComment')
  removeComment(@Req() req: Request, @Body('commentId') commentId: string) {
    const user = req['user']
    if (!user) return new UnauthorizedException()
    return this.commentService.removeCommentById(user, commentId)
  }

  @Get('/getCommentsById')
  getCommentsById(@Query('targetId') targetId: string, @Req() req: Request) {
    const user = req['user']
    return this.commentService.getCommentsById(user, targetId)
  }

  @Post('/addLikes')
  addLikes(@Body() target: { commentId: string; type: 'add' | 'sub' }, @Req() req: Request) {
    const user = req['user']
    if (!user) return new UnauthorizedException()
    return this.commentService.addCommentLikes(user, target.commentId, target.type)
  }
}
