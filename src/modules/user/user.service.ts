import mongoose, { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { LoggerService } from '@/modules/logger/logger.service'
import { UserSignUpInput, UserEntity, UserUpdatePwdInput, UserResponseEntity } from './dto/user.dto'
import { DefaultUserEntity } from './constant/user.constant'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { generateSalt, encrypt, compare } from '@/utils/encrypt'
import { ConfigService } from '@nestjs/config'
import { genStoragePath } from '@/utils/format'
import type { FilterByValue } from '@/interface/util.interface'
import type { ApiResponse } from '@/interface/response.interface'
import type { UserTokenEntity } from './dto/user.dto'

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
   * @description 查找数据库中符合筛选条件的用户，返回处理后的数据
   * @param UserEntity
   * @returns 查询结果
   */
  async findUserByField(
    user: Partial<FilterByValue<UserEntity, string>>
  ): Promise<UserResponseEntity> {
    try {
      const res: UserResponseEntity[] = await this.userModel.aggregate([
        {
          $match: user
        },
        {
          $addFields: {
            userId: { $toString: '$_id' }
          }
        },
        {
          $project: {
            _id: 0,
            __v: 0,
            salt: 0,
            password: 0,
            certification: 0
          }
        }
      ])
      return res[0]
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  /**
   * @description 查找数据库中符合筛选条件的用户，返回原始数据
   * @param UserEntity
   * @returns 查询结果
   */
  async findUserSchemaByField(
    user: Partial<FilterByValue<UserEntity, string>>
  ): Promise<UserEntity> {
    try {
      const res: UserEntity[] = await this.userModel.aggregate([
        {
          $match: user
        },
        {
          $addFields: {
            userId: { $toString: '$_id' }
          }
        },
        {
          $project: {
            _id: 0,
            __v: 0
          }
        }
      ])
      return res[0]
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  async findUsersByIds(ids: mongoose.Types.ObjectId[]): Promise<UserEntity[]> {
    try {
      const res = await this.userModel.aggregate([
        {
          $match: {
            _id: {
              $in: ids
            }
          }
        },
        {
          $addFields: {
            userId: '$_id'
          }
        },
        {
          $project: {
            userId: 1,
            username: 1,
            avatar: 1,
            email: 1
          }
        },
        {
          $project: {
            _id: 0
          }
        }
      ])
      return res || []
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async createUser(user: Partial<UserEntity>) {
    // 注册后对密码执行加密
    const salt = generateSalt()
    const userEntity = {
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
    const createUser = await this.userModel.create(userEntity)
    return await createUser.save()
  }

  /**
   * @description 用户注册接口
   * @param user
   * @returns
   */
  async signup(user: UserSignUpInput): Promise<ApiResponse> {
    const res = await this.findUserSchemaByField({ username: user.username })
    if (res) {
      this.response = getFailResponse('该用户名已被注册', null)
      this.logger.error('/user/signup', `用户${user.username}已注册`)
      return this.response
    }
    try {
      const userEntity: Partial<UserEntity> = {
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
  async login(user: UserSignUpInput): Promise<ApiResponse> {
    const res = await this.findUserSchemaByField({ username: user.username })
    if (!res) {
      this.response = getFailResponse('用户未注册，登录失败', null)
      this.logger.error('/user/login', `${user.username}登录失败，未找到该用户`)
      return this.response
    }
    // 比较密码是否匹配
    if (!compare(user.password, res.password, res.salt)) {
      this.response = getFailResponse('密码错误，登录失败', null)
      this.logger.error('/user/login', `${user.username}登录失败，密码不匹配`)
      return this.response
    }
    const token = this.jwtService.sign({
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
      const res = await this.findUserByField({ _id: new mongoose.Types.ObjectId(user.userId) })
      if (!res) {
        this.logger.error('/user/getUserInfo', `查询${user.userId}的用户信息失败`)
        this.response = getFailResponse('未找到用户', null)
        return this.response
      }
      this.logger.info('/user/getUserInfo', `查询${user.userId}的用户信息成功`)
      this.response = getSuccessResponse('获取用户信息成功', res)
    } catch (err) {
      this.logger.error('/user/getUserInfo', `查询${user.userId}的用户信息失败，失败原因：${err}`)
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
        const res = await this.findUserByField({ _id: new mongoose.Types.ObjectId(user.userId) })

        const token = this.jwtService.sign({
          ...user,
          userId: res.userId,
          role: res.role,
          timestamp: Date.now()
        })

        this.logger.info('/user/updateUserInfo', `${user.userId} 更新个人信息成功`)
        this.response = getSuccessResponse('个人信息更新成功', { accessToken: token })
      }
    } catch (err) {
      this.logger.error('/user/updateUserInfo', `${user.userId} 更新个人信息失败，${err}`)
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
    const { userId } = user
    const { filename } = file
    const { storagePath } = genStoragePath(`${userId}/${filename}`)
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
        const res = await this.findUserByField({ _id: new mongoose.Types.ObjectId(userId) })
        if (res) {
          this.response = getSuccessResponse('头像更换成功', res)
        } else {
          this.response = getSuccessResponse('头像更换成功', null)
        }
        this.logger.info('/user/updateUserAvatar', `${userId} 更换头像成功`)
      }
    } catch (err) {
      this.response = getFailResponse('头像更换成功', null)
      this.logger.error('/user/updateUserAvatar', `${userId} 更新头像失败，${err}`)
    }

    return this.response
  }

  /**
   * @description 更新用户密码
   * @param user
   * @param {PasswordsType} passwords
   * @returns
   */
  async updatePassword(user: UserTokenEntity, passwords: UserUpdatePwdInput) {
    const res = await this.findUserSchemaByField({ _id: new mongoose.Types.ObjectId(user.userId) })
    if (!res) return
    const { password, salt } = res

    const { oldPwd, newPwd, confirmPwd } = passwords
    if (!compare(oldPwd, password, salt)) {
      this.response = getFailResponse('原密码错误，请确认后重新提交', null)
      this.logger.error('/user/updatePassword', `${user.userId}提交的原密码有误`)
      return this.response
    }

    if (newPwd !== confirmPwd) {
      this.response = getFailResponse('新密码与确认密码不同，请确认后重新提交', null)
      this.logger.error('/user/updatePassword', `${user.userId}提交的新密码和确认密码不匹配`)
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
        this.logger.info('/user/updatePassword', `${user.userId} 更新登录密码成功`)
      }
    } catch (err) {
      this.response = getFailResponse('服务器异常，密码更新失败', null)
      this.logger.error('/user/updatePassword', `服务器异常，${user.userId}更新密码失败`)
    }

    return this.response
  }

  /**
   * @description 通过第三方登录等方式创建用户时，需要额外执行补全用户密码的逻辑
   * @param userId
   * @param password
   */
  async fillPassword(userId: string, password: string) {
    try {
      const res = await this.findUserSchemaByField({ _id: new mongoose.Types.ObjectId(userId) })
      if (res) {
        const { role, salt } = res
        const userTokenEntity: UserTokenEntity = {
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
        this.logger.info('/user/fillPwd', `${userId} 设置密码成功，可以登录`)
      }
    } catch (err) {
      this.response = getSuccessResponse('密码设置失败', null)
      this.logger.info('/user/fillPwd', `密码设置失败，失败原因：${err}`)
    }
    return this.response
  }
}
