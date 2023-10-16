import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { LoggerService } from '@/modules/logger/logger.service'
import { User } from '@/interface/user.interface'
import type { ApiResponse } from '@/interface/response.interface'
import { UserSignUpDTO, DefaultUserEntity } from './DTO/user.dto'

@Injectable()
export class UserService {
  private response: ApiResponse
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * @description 查找数据库中符合该 accountId 的用户
   * @param accountId 账户ID
   * @returns 查询结果
   */
  async findOneByName(user: { username: string }): Promise<User[]> {
    return await this.userModel.find({ username: user.username })
  }

  /**
   * @description 用户注册接口
   * @param user
   * @returns
   */
  async signup(user: UserSignUpDTO): Promise<ApiResponse> {
    const res = await this.findOneByName(user)
    if (res && res.length) {
      this.logger.error('userService -> signup', '用户已注册')
      this.response = {
        Code: -1,
        Message: '用户已注册',
        ReturnData: null
      }
      return this.response
    }
    try {
      const createUser = await this.userModel.create({
        ...DefaultUserEntity,
        ...user,
        avatar: `http://localhost:3000/static/avatar/avatar_${
          Math.floor(Math.random() * 5) + 1
        }.png`
      })
      await createUser.save()
      this.logger.info(null, '新增用户成功')
      this.response = {
        Code: 1,
        Message: '新增成功',
        ReturnData: user.username
      }
    } catch (err) {
      this.logger.error(null, err)
      this.response = {
        Code: -1,
        Message: '用户新增失败，请联系负责人核对',
        ReturnData: err
      }
    }
    return this.response
  }

  async login(user: UserSignUpDTO): Promise<ApiResponse> {
    const res = await this.findOneByName(user)
    const findIdx = res.findIndex((user) => user.password === user.password)
    if (!res || !res.length || findIdx === -1) {
      this.response = {
        Code: -1,
        Message: '用户未注册，登录失败',
        ReturnData: null
      }
      return this.response
    }
    if (res[findIdx].password !== user.password) {
      this.response = {
        Code: -1,
        Message: '密码错误，登录失败',
        ReturnData: null
      }
      return this.response
    }
    const token = this.jwtService.sign({
      ...user,
      timestamp: Date.now()
    })
    this.response = {
      Code: 1,
      Message: '登录成功',
      ReturnData: {
        accessToken: token
      }
    }
    return this.response
  }

  async getUserInfo(user: UserSignUpDTO) {
    const res = await this.findOneByName(user)
    if (!res || !res.length) {
      this.response = {
        Code: -1,
        Message: '未找到用户',
        ReturnData: null
      }
      return this.response
    }
    this.response = {
      Code: 1,
      Message: '成功',
      ReturnData: res[0]
    }
    return this.response
  }
}
