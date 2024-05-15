import mongoose, { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { LoggerService } from '@/modules/logger/logger.service'
import { UserSignUp, UserEntity } from './dto/user.dto'
import { DefaultUserEntity } from './interface/user.interface'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { generateSalt, encrypt, compare } from '@/utils/encrypt'
import { ConfigService } from '@nestjs/config'
import { genStoragePath } from '@/utils/format'
import type { FilterByValue } from '@/interface/util.interface'
import type { ApiResponse } from '@/interface/response.interface'
import type { UserEntityDTO, UserTokenEntity, PasswordsType } from './interface/user.interface'

@Injectable()
export class UserService {
  private response: ApiResponse
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * @description 查找数据库中符合该用户名的用户
   * @param username 用户名
   * @returns 查询结果
   */
  async findOneByField(
    user: Partial<FilterByValue<UserEntityDTO, string> & { _id: mongoose.Types.ObjectId }>,
    needAll = false
  ): Promise<UserEntityDTO[]> {
    return await this.userModel.aggregate([
      {
        $match: user
      },
      {
        $addFields: {
          userId: { $toString: '$_id' }
        }
      },
      needAll
        ? {
            $project: {
              _id: 0,
              __v: 0
            }
          }
        : {
            $project: {
              _id: 0,
              __v: 0,
              salt: 0
            }
          }
    ])
  }

  async findUserById(id: string) {
    try {
      const res = await this.userModel.findOne({ id })
      return res
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async createUser(user: Partial<UserEntityDTO>) {
    // 注册后对密码执行加密
    const salt = generateSalt()
    const userEntity: UserEntityDTO & { salt: string } = {
      ...DefaultUserEntity,
      ...user,
      salt,
      password: user.password ? encrypt(user.password, salt) : '',
      avatar:
        user.avatar ??
        `${this.configService.get('NEST_APP_URL')}/static/avatar/avatar_${
          Math.floor(Math.random() * 5) + 1
        }.png`
    }
    console.log(userEntity)
    const createUser = await this.userModel.create(userEntity)
    return await createUser.save()
  }

  /**
   * @description 用户注册接口
   * @param user
   * @returns
   */
  async signup(user: UserSignUp): Promise<ApiResponse> {
    const res = await this.findOneByField({ username: user.username })
    if (res && res.length) {
      this.response = getFailResponse('该用户名已被注册', null)
      this.logger.error('/user/signup', `用户${user.username}已注册`)
      return this.response
    }
    try {
      const userEntity: Partial<UserEntityDTO> = {
        ...user
      }
      await this.createUser(userEntity)
      this.response = getSuccessResponse('注册成功', user.username)
      this.logger.info('/user/signup', '新增用户成功')
    } catch (err) {
      this.response = getFailResponse('服务器异常，用户注册失败', null)
      this.logger.error('/user/signup', err)
    }
    return this.response
  }

  /**
   * @description 用户登录接口
   * @param user 用户的部分信息
   * @returns
   */
  async login(user: UserSignUp): Promise<ApiResponse> {
    const res = await this.findOneByField({ username: user.username }, true)
    const findIdx = res.findIndex((user) => user.password === user.password)
    if (!res || !res.length || findIdx === -1) {
      this.response = getFailResponse('用户未注册，登录失败', null)
      this.logger.error('/user/login', `${user.username}登录失败，未找到该用户`)
      return this.response
    }
    // 比较密码是否匹配
    if (!compare(user.password, res[findIdx].password, res[findIdx].salt)) {
      this.response = getFailResponse('密码错误，登录失败', null)
      this.logger.error('/user/login', `${user.username}登录失败，密码不匹配`)
      return this.response
    }
    const token = this.jwtService.sign({
      username: user.username,
      userId: res[0].userId,
      role: res[0].role,
      timestamp: Date.now()
    })
    this.response = getSuccessResponse('登录成功', {
      accessToken: token
    })
    this.logger.info('/user/login', `${user.username}登录成功`)

    return this.response
  }

  /**
   * @description 获取用户的详细信息
   * @param user 用户的部分信息
   * @returns
   */
  async getUserInfo(user: UserTokenEntity) {
    try {
      const res = await this.findOneByField({ _id: new mongoose.Types.ObjectId(user.userId) })
      if (!res || !res.length) {
        this.logger.error('/user/getUserInfo', `查询${user.username}的用户信息失败`)
        this.response = getFailResponse('未找到用户', null)
        return this.response
      }
      this.logger.info('/user/getUserInfo', `查询${user.username}的用户信息成功`)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = res[0]
      this.response = getSuccessResponse('获取用户信息成功', rest)
    } catch (err) {
      this.logger.error('/user/getUserInfo', `查询${user.username}的用户信息失败`)
      this.response = getFailResponse('服务器异常，用户信息查询失败', null)
    }
    return this.response
  }

  /**
   * @description 更新用户个人信息
   * @param user
   * @param userInfo
   * @returns
   */
  async updateUserInfo(user: UserTokenEntity, userInfo: Partial<UserEntity>): Promise<ApiResponse> {
    // 更新前移除 userId 等基于数据库文档生成的字段
    // delete userInfo.userId
    try {
      const res = await this.userModel.updateOne(
        {
          _id: user.userId
        },
        {
          $set: userInfo
        }
      )

      const { matchedCount, modifiedCount } = res
      if (matchedCount >= 1 && modifiedCount === 1) {
        const res = await this.findOneByField({ username: userInfo.username || user.username })

        const token = this.jwtService.sign({
          ...user,
          userId: res[0].userId,
          role: res[0].role,
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

  /**
   * @description 更新用户头像
   * @param user 从 token 中解析出来的用户信息
   * @param file 头像文件
   * @returns
   */
  async updateUserAvatar(user: UserTokenEntity, file: Express.Multer.File) {
    const { userId, username } = user
    const { fieldname, filename } = file
    const { storagePath } = genStoragePath(`${username}/${fieldname}/${filename}`)
    // const storagePath = `${this.configService.get('NEST_APP_URL')}/static/avatar/${username}/${fieldname}/${filename}`
    try {
      const res = await this.userModel.updateOne(
        {
          _id: userId
        },
        {
          $set: { avatar: storagePath }
        }
      )
      const { matchedCount, modifiedCount } = res
      if (matchedCount >= 1 && modifiedCount === 1) {
        const res = await this.findOneByField({ username })
        if (res.length) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...rest } = res[0]
          this.response = getSuccessResponse('头像更换成功', rest)
        } else {
          this.response = getSuccessResponse('头像更换成功', null)
        }
        this.logger.info('/user/updateUserAvatar', `${username} 更换头像成功`)
      }
    } catch (err) {
      this.response = getFailResponse('头像更换成功', null)
      this.logger.error('/user/updateUserAvatar', `${username} 更新头像失败，${err}`)
    }

    return this.response
  }

  /**
   * @description 更新用户密码
   * @param user
   * @param {PasswordsType} passwords
   * @returns
   */
  async updatePassword(user: UserTokenEntity, passwords: PasswordsType) {
    const res = await this.findOneByField({ _id: new mongoose.Types.ObjectId(user.userId) }, true)
    if (!res || !res.length) return
    const { password, salt } = res[0]

    const { oldPwd, newPwd, confirmPwd } = passwords
    if (!compare(oldPwd, password, salt)) {
      this.response = getFailResponse('原密码错误，请确认后重新提交', null)
      this.logger.error('/user/updatePassword', `${user.username}提交的原密码有误`)
      return this.response
    }

    if (newPwd !== confirmPwd) {
      this.response = getFailResponse('新密码与确认密码不同，请确认后重新提交', null)
      this.logger.error('/user/updatePassword', `${user.username}提交的新密码和确认密码不匹配`)
      return this.response
    }

    try {
      const res = await this.userModel.updateOne(
        {
          _id: user.userId
        },
        {
          $set: { password: encrypt(newPwd, salt) }
        }
      )

      const { matchedCount, modifiedCount } = res
      if (matchedCount >= 1 && modifiedCount === 1) {
        this.response = getSuccessResponse('用户密码更新成功', 'ok')
        this.logger.info('/user/updatePassword', `${user.username} 更新登录密码成功`)
      }
    } catch (err) {
      this.response = getFailResponse('服务器异常，密码更新失败', null)
      this.logger.error('/user/updatePassword', `服务器异常，${user.username}更新密码失败`)
    }

    return this.response
  }

  /**
   * @description 未登录情况下，更新用户密码
   * @param userId
   * @param password
   */
  async fillPassword(userId: string, password: string) {
    try {
      const res = await this.findOneByField({ _id: new mongoose.Types.ObjectId(userId) }, true)
      if (res && res.length) {
        const { username, role, salt } = res[0]
        const userTokenEntity: UserTokenEntity = {
          username,
          userId,
          role
        }
        await this.updateUserInfo(userTokenEntity, { password: encrypt(password, salt) })
        const token = this.jwtService.sign({
          ...userTokenEntity,
          timestamp: Date.now()
        })
        this.response = getSuccessResponse('密码设置成功', {
          accessToken: token
        })
        this.logger.info('/user/fillPwd', `${username} 设置密码成功，可以登录`)
      }
    } catch (err) {
      this.response = getSuccessResponse('密码设置失败', null)
      this.logger.info('/user/fillPwd', `密码设置失败，失败原因：${err}`)
    }
    return this.response
  }
}
