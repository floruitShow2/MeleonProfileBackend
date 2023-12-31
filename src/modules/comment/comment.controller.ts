import {
  Controller,
  Post,
  Get,
  Req,
  Body,
  UnauthorizedException,
  Param,
  Query
} from '@nestjs/common'
import { CommentService } from './comment.service'
import { CommentEntity } from './dto/comment.dto'
import { formatToDateTime } from '@/utils/time'

@Controller('comment')
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

  @Get('/getCommentsById')
  getCommentsById(@Query('targetId') targetId: string, @Req() req: Request) {
    const user = req['user']
    return this.commentService.getCommentsById(user.userId, targetId)
  }

  @Post('/addLikes')
  addLikes(@Body() target: { commentId: string; type: 'add' | 'sub' }, @Req() req: Request) {
    const user = req['user']
    if (!user) return new UnauthorizedException()
    return this.commentService.addCommentLikes(user.userId, target.commentId, target.type)
  }
}
