import { Injectable, NestMiddleware } from '@nestjs/common'
import { Response, NextFunction } from 'express'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class CryptoMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = (req.headers as any).user_token
    const payload = this.jwtService.decode(token)
    if (!token) {
      next()
    } else if (!payload || typeof payload === 'string') {
      // token 不合法
      res.status(401).json({
        Code: -1,
        Message: 'token 解析结果有误',
        ReturnData: null
      })
      return
    } else {
      const { username, userId, role, timestamp, exp } = payload
      if (Date.now() - timestamp > exp) {
        // 超时
        // token 不合法
        res.status(401).json({
          Code: -1,
          Message: '用户授权已超时，请重新登录',
          ReturnData: null
        })
        return
      } else {
        // 成功
        req['user'] = { username, userId, role }
        next()
      }
    }
  }
}
