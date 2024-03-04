import { Controller, Post, Get, Body, Req, UseInterceptors, UploadedFile } from '@nestjs/common'
import { join } from 'path'
import { diskStorage } from 'multer'
import { existsSync, mkdirSync } from 'fs'
import { Roles } from '@/decorator/Roles'
import { Role } from '@/constants/auth'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { PasswordsType, UserEntityDTO, UserSignUp } from '@/modules/user/dto/user.dto'
import { UserService } from './user.service'

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

  @Post('updateUserAvatar')
  @UseInterceptors(FileInterceptor('avatar', { storage: diskStorage({
    destination: function(req, res, cb) {
      const storagePath = join(process.cwd(), `../../../public/avatar/${req['user'].username}/${res.fieldname}`)
      if (!existsSync(storagePath)) mkdirSync(storagePath, { recursive: true })
      cb(null, storagePath)
    },
    filename: function (req, res, cb) {
      cb(null, res.originalname)
    }
  }) }))
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
  async updateUserInfo(@Req() request: Request, @Body() userInfo: Partial<UserEntityDTO>) {
    return this.userService.updateUserInfo(request['user'], userInfo)
  }

  @Post('updatePassword')
  @ApiOperation({
    summary: '更新用户密码'
  })
  async updatePassword(@Req() request: Request, @Body() pwds: PasswordsType) {
    return this.userService.updatePassword(request['user'], pwds)
  }

  // 该接口仅对权限为 admin 的用户开发，测试 Guards 能否拦截权限不符合的用户发来的请求
  @Get('hello')
  @Roles(Role.Admin)
  getHello() {
    return 'hello'
  }
}
