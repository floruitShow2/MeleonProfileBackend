import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { LoggerService } from '@/modules/logger/logger.service'
import type { ApiResponse } from '@/interface/response.interface'
import { DefaultUserEntity, UserSignUp, UserEntity, UserEntityDTO } from './DTO/user.dto'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'

@Injectable()
export class UserService {
  private response: ApiResponse
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * @description 查找数据库中符合该 accountId 的用户
   * @param accountId 账户ID
   * @returns 查询结果
   */
  async findOneByName(user: { username: string }): Promise<UserEntity[]> {
    return await this.userModel.aggregate([
      {
        $match: { username: user.username }
      },
      {
        $addFields: {
          userId: '$_id'
        }
      },
      {
        $project: {
          password: 0,
          _id: 0,
          __v: 0
        }
      }
    ])
  }

  /**
   * @description 用户注册接口
   * @param user
   * @returns
   */
  async signup(user: UserSignUp): Promise<ApiResponse> {
    const res = await this.findOneByName(user)
    if (res && res.length) {
      this.logger.error('UserService', '用户已注册')
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

  /**
   * @description 用户登录接口
   * @param user 用户的部分信息
   * @returns
   */
  async login(user: UserSignUp): Promise<ApiResponse> {
    const res = await this.findOneByName(user)
    const findIdx = res.findIndex((user) => user.password === user.password)
    if (!res || !res.length || findIdx === -1) {
      this.logger.error(null, `${user.username}登录失败，未找到该用户`)
      this.response = {
        Code: -1,
        Message: '用户未注册，登录失败',
        ReturnData: null
      }
      return this.response
    }
    if (res[findIdx].password !== user.password) {
      this.logger.error(null, `${user.username}登录失败，密码不匹配`)
      this.response = {
        Code: -1,
        Message: '密码错误，登录失败',
        ReturnData: null
      }
      return this.response
    }
    const token = this.jwtService.sign({
      ...user,
      userId: res[0]._id,
      roles: res[0].roles,
      timestamp: Date.now()
    })
    this.logger.info(null, `${user.username}登录成功`)
    
    this.response = getSuccessResponse('登录成功', {
      accessToken: token
    })

    return this.response
  }

  /**
   * @description 获取用户的详细信息
   * @param user 用户的部分信息
   * @returns
   */
  async getUserInfo(user: UserSignUp) {
    const res = await this.findOneByName(user)
    if (!res || !res.length) {
      this.logger.error(null, `查询${user.username}的用户信息失败`)
      this.response = {
        Code: -1,
        Message: '未找到用户',
        ReturnData: null
      }
      return this.response
    }
    this.logger.info(null, `查询${user.username}的用户信息成功`)
    this.response = {
      Code: 1,
      Message: '成功',
      ReturnData: res[0]
    }
    return this.response
  }

  /**
   * @description 更新用户个人信息
   * @param user 
   * @param userInfo 
   * @returns 
   */
  async updateUserInfo(user: { userId: string; username: string }, userInfo: Partial<UserEntityDTO>): Promise<ApiResponse> {
    try {
      const res = await this.userModel.updateOne({
        _id: user.userId
      }, {
        $set: userInfo
      })

      const { matchedCount, modifiedCount } = res
      if (matchedCount >= 1 && modifiedCount === 1) {
        const res = await this.findOneByName({ username: userInfo.username || user.username })

        const token = this.jwtService.sign({
          ...user,
          userId: res[0]._id,
          roles: res[0].roles,
          timestamp: Date.now()
        })

        this.logger.info('/user/updateUserInfo', `${user.username} 更新个人信息成功`)
        this.response = getSuccessResponse('个人信息更新成功', { accessToken: token })
      }
    } catch (err) {
      this.logger.error('/user/updateUserInfo', `${user.username} 更新个人信息失败，${err}`)
      this.response = getFailResponse('个人信息更新失败', null)
    }

    return this.response
  }

  async updateUserAvatar(user: { userId: string; username: string }, file: Express.Multer.File) {

    const { userId, username } = user
    const { fieldname, filename } = file
    const storagePath = `http://localhost:3000/static/avatar/${username}/${fieldname}/${filename}`

    try {
      const res = await this.userModel.updateOne({
        _id: userId
      }, {
        $set: { avatar: storagePath }
      })

      const { matchedCount, modifiedCount } = res
      if (matchedCount >= 1 && modifiedCount === 1) {
        const res = await this.findOneByName({ username: username })
        this.logger.info('/user/updateUserAvatar', `${username} 更换头像成功`)
        this.response = getSuccessResponse('头像更换成功', res.length ? res[0] : null)
      }
    } catch (err) {
      this.logger.error('/user/updateUserAvatar', `${username} 更新头像失败，${err}`)
      this.response = getFailResponse('头像更换成功', null)
    }

    return this.response
  }
}
