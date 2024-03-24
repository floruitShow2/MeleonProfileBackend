import { Controller, Get, HttpStatus, Post, Query, Redirect } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { HttpService } from '@nestjs/axios'
import { AuthService } from './auth.service'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService
  ) {}

  @Get('/github')
  async handleGithubAuth(@Query() query: { code: string }) {
    const tokenEntity = await this.authService.genGithubToken(query.code)
    const userInfo = await this.authService.genUserInfo(tokenEntity)
    console.log('auth controller', userInfo)
    return this.authService.handleGithubSignup(tokenEntity, userInfo)
  }
}
