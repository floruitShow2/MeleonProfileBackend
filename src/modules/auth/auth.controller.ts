import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/github')
  async handleGithubAuth(@Query() query: { code: string }) {
    return this.authService.handleGithubSignup(query.code)
  }
}
