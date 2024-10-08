import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { JwtService } from '@nestjs/jwt'
import { firstValueFrom } from 'rxjs'
import { LoggerService } from '@/modules/logger/logger.service'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { UserService } from '@/modules/user/user.service'
import type { ApiResponse } from '@/interface/response.interface'
import type { GithubEmailInfo, GithubTokenEntity, GithubUserInfo } from './interface/auth.interface'

@Injectable()
export class AuthService {
  private response: ApiResponse

  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly loggerService: LoggerService
  ) {}

  /**
   * @description 生成 token
   * @param code github 授权后返回的 code
   * @returns {GithubTokenEntity}
   */
  async genGithubToken(code: string) {
    const config = {
      method: 'post',
      uri: 'https://github.com/login/oauth/access_token',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: {
        client_id: 'a21788e757ea3ad9aed4',
        client_secret: '324f0c65a35772ddfdb713ee02223d7f32063723',
        code
      }
    }

    const { data } = await firstValueFrom(
      this.httpService
        .post<GithubTokenEntity>(config.uri, config.body, {
          headers: config.headers
        })
        .pipe((res) => {
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
    try {
      const githubConfig = {
        method: 'get',
        url: `https://api.github.com/user`,
        headers: {
          Authorization: `token ${tokenEntity.access_token}`,
          'User-Agent': 'easterCat'
        }
      }

      const { data: userInfo } = await firstValueFrom(
        this.httpService
          .get<GithubUserInfo>(githubConfig.url, { headers: githubConfig.headers })
          .pipe((res) => res)
      )

      return userInfo
    } catch (err) {
      this.loggerService.error(
        'https://api.github.com/user',
        `获取github账号信息失败，失败原因：${err}`
      )
    }
  }

  async getUserEmail(tokenEntity: GithubTokenEntity) {
    try {
      const emailConfig = {
        method: 'get',
        url: 'https://api.github.com/user/emails',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${tokenEntity.access_token}`
        }
      }

      const { data: emailsInfo } = await firstValueFrom(
        this.httpService
          .get<GithubEmailInfo[]>(emailConfig.url, { headers: emailConfig.headers })
          .pipe((res) => res)
      )

      const findEmail = emailsInfo.find((email) => email.primary)

      return findEmail?.email ?? ''
    } catch (err) {
      this.loggerService.error(
        'https://api.github.com/user/emails',
        `获取github账号邮箱信息失败，失败原因：${err}`
      )
    }
  }

  async handleGithubSignup(code: string) {
    // 创建单独的用户
    try {
      // 获取 github 的 access_token 等信息
      const tokenEntity = await this.genGithubToken(code)
      // 获取 github 账号信息
      const userInfo = await this.genUserInfo(tokenEntity)
      // 根据 userInfo 里的 id 判断是否已有授权用户
      const findUser = await this.userService.findUserSchemaByField({ certification: userInfo.id })
      // 用户已创建，直接登录
      if (findUser) {
        const token = this.jwtService.sign({
          userId: findUser._id.toString(),
          role: findUser.role,
          timestamp: Date.now()
        })
        this.response = getSuccessResponse('账号已授权，登录成功', { accessToken: token })
        this.loggerService.info('/auth/github', `${findUser[0].username}已授权，直接登录`)
        return this.response
      }
      // 获取 github 邮箱信息
      const emailsInfo = await this.getUserEmail(tokenEntity)
      if (userInfo) userInfo.email = emailsInfo
      const userEntity = {
        certification: userInfo.id,
        username: userInfo.email,
        introduction: userInfo.bio,
        avatar: userInfo.avatar_url,
        email: userInfo.email,
        organization: userInfo.company
      }
      const res = await this.userService.createUser(userEntity)
      this.response = getSuccessResponse('授权账户创建成功', {
        userId: String(res._id)
      })
      this.loggerService.info('/auth/github', `${res.username}通过 gihub auth 创建账户成功`)
      return this.response
    } catch (err) {
      this.response = getFailResponse('授权失败', null)
      this.loggerService.error('/auth/github', `授权失败，失败原因：${err}`)
      return this.response
    }
  }
}
