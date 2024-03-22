import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { JwtService } from '@nestjs/jwt'
import { firstValueFrom } from 'rxjs'
import { LoggerService } from '@/modules/logger/logger.service'
import type { GithubTokenEntity, GithubUserInfo } from './dto/auth.dto'
import { getSuccessResponse } from '@/utils/service/response'
import type { ApiResponse } from '@/interface/response.interface'

@Injectable()
export class AuthService {
  private response: ApiResponse

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly loggerService: LoggerService
  ) {}

  /**
   * @description 生成 token 
   * @param code github 授权后返回的 code
   * @returns {GithubTokenEntity}
   */
  async genGithubToken(code: string) {
    const clientID = 'Iv1.ff0400a475ff9d94'
    const clientSecret = 'b7fc9b258294dd6648cd2bd7938a16e00d3a20ac'
    const config = {
      method: 'post',
      uri:
        'http://github.com/login/oauth/access_token?' +
        `client_id=${clientID}&` +
        `client_secret=${clientSecret}&` +
        `code=${code}`,
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      }
    }

    const { data } = await firstValueFrom(
      this.httpService.post<GithubTokenEntity>(
        config.uri,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          }
        }
      ).pipe((res) => {
        return res
      })
    )

    return data
  }

  /**
   * @description 获取 github 用户信息
   * @param tokenEntity genGithubToken 方法的返回值
   * @returns {GithubUserInfo}
   */
  async genUserInfo(tokenEntity: GithubTokenEntity) {
    const githubConfig = {
      method: 'get',
      uri: `https://api.github.com/user`,
      headers: {
        Authorization: `token ${tokenEntity.access_token}`,
        'User-Agent': 'easterCat'
      }
    }
    const { data } = await firstValueFrom(
      this.httpService.get(githubConfig.uri, { headers: githubConfig.headers }).pipe(res => res)
    )

    return data
  }

  async handleGithubSignup(tokens: GithubTokenEntity, userInfo: GithubUserInfo) {
    console.log(tokens, userInfo)
    // 创建单独
    try {
      this.response = getSuccessResponse('登录成功', {
        accessToken: tokens.access_token
      })
      return this.response
    } catch (err) {
      console.log('err')
    }
  }
}
