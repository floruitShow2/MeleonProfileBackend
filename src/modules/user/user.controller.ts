import { Controller, Post, Get, Body, SetMetadata, ForbiddenException, Req } from '@nestjs/common'
import { UserService } from './user.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { UserSignUp } from '@/interface/user.interface'
import { Roles } from '@/decorator/Roles'
import { Role } from '@/constants/auth'

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @ApiOperation({
    summary: '用户注册接口'
  })
  async signup(@Body() userDto: UserSignUp) {
    return await this.userService.signup(userDto)
  }

  @Post('login')
  @ApiOperation({
    summary: '用户登录接口'
  })
  async login(@Body() userDto: UserSignUp) {
    return await this.userService.login(userDto)
  }

  @Get('getUserInfo')
  @ApiOperation({
    summary: '获取用户信息'
  })
  async getUserInfo(@Req() request: Request) {
    return this.userService.getUserInfo(request['user'])
  }

  // 该接口仅对权限为 admin 的用户开发，测试 Guards 能否拦截权限不符合的用户发来的请求
  @Get('hello')
  @Roles(Role.Admin)
  getHello() {
    return 'hello'
  }
}
