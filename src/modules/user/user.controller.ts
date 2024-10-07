import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException
} from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import type { Request } from 'express'
import { Roles } from '@/decorator/Roles'
import { Role } from '@/constants/auth'
import { genStoragePath } from '@/utils/format'
import { UserService } from './user.service'
import { UserSignUpInput, UserUpdatePwdInput } from './dto/user.dto'

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @ApiOperation({
    summary: '用户注册接口'
  })
  async signup(@Body() userDto: UserSignUpInput) {
    return await this.userService.signup(userDto)
  }

  @Post('login')
  @ApiOperation({
    summary: '用户登录接口'
  })
  async login(@Body() userDto: UserSignUpInput) {
    return await this.userService.login(userDto)
  }

  @Get('getUserInfo')
  @ApiOperation({
    summary: '获取用户信息'
  })
  async getUserInfo(@Req() request: Request, @Query('userId') userId: string) {
    const userInfo = request['user']
    if (!userId && !userInfo?.userId) return new BadRequestException('no userId')
    return this.userService.getUserInfo(userId || userInfo?.userId)
  }

  @Post('updateUserAvatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: function (req, res, cb) {
          const { diskPath } = genStoragePath(req['user'].userId)
          cb(null, diskPath)
        },
        filename: function (req, res, cb) {
          cb(null, res.originalname)
        }
      })
    })
  )
  @ApiOperation({
    summary: '更新用户头像'
  })
  async updateAvatar(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
    return this.userService.updateUserAvatar(request['user'], file)
  }

  @Post('updateUserInfo')
  @ApiOperation({
    summary: '更新用户信息'
  })
  async updateUserInfo(@Req() request: Request, @Body() userInfo: any) {
    return this.userService.updateUserInfo(request['user'], userInfo)
  }

  @Post('updatePassword')
  @ApiOperation({
    summary: '更新用户密码'
  })
  async updatePassword(@Req() request: Request, @Body() pwds: UserUpdatePwdInput) {
    return this.userService.updatePassword(request['user'], pwds)
  }

  @Post('fillPassword')
  @ApiOperation({
    summary: '补全用户密码'
  })
  async fillPassword(@Body() data: { userId: string; password: string }) {
    return this.userService.fillPassword(data.userId, data.password)
  }

  @Get('search')
  async searchUsers(@Req() req: Request, @Query('query') query: string) {
    console.log(query, req.user)
    return await this.userService.searchUsers(req.user.userId, query)
  }

  // 该接口仅对权限为 admin 的用户开发，测试 Guards 能否拦截权限不符合的用户发来的请求
  @Get('hello')
  @Roles(Role.Admin)
  getHello() {
    return 'hello'
  }
}
