import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import { UserEntity } from '@/interface/user.interface'

@Injectable()
export class AuthService {
  private response: Service.ServiceResponse
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  async validateUser(user: UserEntity) {
    const { username } = user
    const response = await this.userService.findOneByName({ username })
    if (response.length === 0) {
      this.response = {
        code: -1,
        message: '用户尚未注册',
        data: null
      }
      throw this.response
    }
    const findUser = response[0]
    const payload = { userId: findUser.id, userName: findUser.username, timeStamp: Date.now() }
    return {
      code: 1,
      message: '获取成功',
      data: {
        access_token: await this.jwtService.signAsync(payload)
      }
    }
  }
}
