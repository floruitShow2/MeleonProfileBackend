import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserEntity } from '@/interface/user.interface'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@/guards/auth.guard'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/getAccessToken')
  @ApiOperation({
    summary: '获取 jwttoken'
  })
  async getAccessToken(@Body() user: UserEntity) {
    return await this.authService.validateUser(user)
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '测试 guard 是否生效'
  })
  @Get('profile')
  getProfile(@Request() request) {
    return request.user
  }
}
