import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const token = this.extractTokenFromReqHeader(req)
    if (!token) throw new UnauthorizedException()

    const payload = this.jwtService.decode(token)
    if (typeof payload === 'string') {
      throw new UnauthorizedException()
    }
    return true
  }

  private extractTokenFromReqHeader(request: Request) {
    const token = request.headers['user_token']
    return Array.isArray(token) ? token[0] : token
  }
}
