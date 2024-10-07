import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import mongoose, { Model } from 'mongoose'
import { UserService } from '@/modules/user/user.service'
import { UserTokenEntity } from '@/modules/user/dto/user.dto'
import { ApiResponse } from '@/interface/response.interface'
import { formatToDateTime } from '@/utils/time'
import { isString, toObjectId } from '@/utils/is'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { encryptPrivateInfo, decryptPrivateInfo } from '@/utils/encrypt'
import { ChatRoomEntity, CreateRoomInput, InviteMemberInput } from './dto/chat-room.dto'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class ChatRoomService {
  private response: ApiResponse

  constructor(
    @InjectModel(ChatRoomEntity.name) private chatRoomModel: Model<ChatRoomEntity>,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {}

  async createRoom(user: UserTokenEntity, chatRoomInput: CreateRoomInput) {
    const { userId } = user
    const createTime = formatToDateTime(new Date())

    try {
      const res = await this.chatRoomModel.create({
        roomName: chatRoomInput.roomName,
        roomDescription: chatRoomInput.roomDescription,
        roomCover:
          chatRoomInput.roomCover ??
          `${this.configService.get('NEST_APP_URL')}/static/avatar/avatar_${
            Math.floor(Math.random() * 5) + 1
          }.png`,
        roomType: chatRoomInput.roomType,
        members: [userId, ...chatRoomInput.members.filter((id) => !!id)].map((id) =>
          toObjectId(id)
        ),
        isPinned: false,
        noDisturbing: false,
        creator: new mongoose.Types.ObjectId(userId),
        createTime
      })
      await res.save()

      this.response = getSuccessResponse('房间创建成功', res._id.toString())
      return this.response
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException()
    }
  }

  async getRoomsByUserId(userId: string) {
    try {
      const res = await this.chatRoomModel.aggregate([
        {
          $match: {
            members: {
              $all: [new mongoose.Types.ObjectId(userId)]
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            foreignField: '_id',
            localField: 'members',
            as: 'members',
            pipeline: [
              {
                $addFields: {
                  userId: '$_id'
                }
              },
              {
                $project: {
                  password: 0,
                  salt: 0,
                  certification: 0,
                  role: 0,
                  _id: 0,
                  __v: 0
                }
              }
            ]
          }
        },
        {
          $addFields: {
            roomId: '$_id'
          }
        },
        {
          $project: {
            _id: 0,
            __v: 0
          }
        }
      ])

      this.response = getSuccessResponse('房间查询成功', res)
      return this.response
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException(err.message)
    }
  }

  async searchRoomsByQuery(query: string) {
    try {
      const res = await this.chatRoomModel.aggregate([
        {
          $match: {
            roomName: {
              $regex: query,
              $options: 'i'
            }
          }
        },
        {
          $addFields: {
            roomId: '$_id'
          }
        },
        {
          $project: {
            _id: 0,
            __v: 0
          }
        }
      ])

      return getSuccessResponse('聊天室查询成功', res)
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  async findRoomById(roomId: string): Promise<ChatRoomEntity> {
    try {
      const findRoom = await this.chatRoomModel.aggregate([
        {
          $match: {
            _id: toObjectId(roomId)
          }
        },
        {
          $addFields: {
            roomId: '$_id'
          }
        },
        {
          $project: {
            _id: 0,
            __v: 0
          }
        }
      ])
      if (!findRoom || !findRoom.length) throw new BadRequestException('参数异常，聊天室不存在')
      return findRoom[0]
    } catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

  async deleteRoom(user: UserTokenEntity, roomId: string) {
    const targetRoom = await this.findRoomById(roomId)
    if (!targetRoom) throw new BadRequestException('Room not found')

    if (targetRoom.creator.toString() !== user.userId)
      throw new ForbiddenException('not authorized')

    try {
      await this.chatRoomModel.deleteOne({ _id: roomId })
      this.response = getSuccessResponse('聊天室删除成功', roomId)
      return this.response
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException()
    }
  }

  /**
   * @description 基于 roomId 生成邀请二维码，包含 聊天室ID 及 二维码创建者ID
   * @param roomId
   */
  async generateInviteCode(userId: string, roomId: string) {
    try {
      const findRoom = await this.findRoomById(roomId)
      if (!findRoom) {
        throw new BadRequestException('参数异常，聊天室不存在')
      }
      this.response = getSuccessResponse('ok', encryptPrivateInfo(`${roomId}-${userId}`))
      return this.response
    } catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

  /**
   * @description 根据邀请码查询 房间 及 邀请方 的信息
   * @param inviteCode
   * @returns
   */
  async getDetailsByInviteCode(inviteCode: string) {
    const [roomId, userId] = decryptPrivateInfo(inviteCode).split('-')
    try {
      const roomDetails = await this.findRoomById(roomId)
      const userDetails = await this.userService.findUserById(userId)
      this.response = getSuccessResponse('查询成功', { room: roomDetails, user: userDetails[0] })
      return this.response
    } catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

  /**
   * @description 判断某个用户是否已经存在于聊天室内
   * @param userId
   * @param roomId
   * @returns
   */
  async isAlreadyInRoom(userId: string, roomId: string) {
    try {
      const findRoom = await this.findRoomById(roomId)
      return findRoom.members.some((memberId) => memberId.equals(toObjectId(userId)))
    } catch (err) {
      return new InternalServerErrorException(err)
    }
  }

  async inviteMemberByUserId(user: UserTokenEntity, data: InviteMemberInput) {
    try {
      const { userId } = user
      const { roomId, userIds } = data

      const isInRoom = await this.isAlreadyInRoom(userId, roomId)
      if (!isInRoom) {
        throw new BadRequestException('您尚未加入该群聊，无法邀请该用户')
      }

      const alreadyInMembers = await this.getMemberIds(roomId)
      const ids = alreadyInMembers.map((item) => item.toString())
      const finalIds = (isString(userIds) ? [userIds] : userIds)
        .filter((id) => ids.indexOf(id) === -1)
        .map((id) => toObjectId(id))

      if (finalIds.length === 0) {
        return getFailResponse('用户已加入群聊', null)
      }
      await this.chatRoomModel.updateOne(
        { _id: toObjectId(roomId) },
        {
          $push: {
            members: {
              $each: finalIds
            }
          }
        }
      )
      this.logger.info('/chat/inviteMemberByUserId', `${userId} 邀请${finalIds}加入群聊${roomId}`)
      return getSuccessResponse('成员已加入群聊', 'ok')
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  /**
   * @description 通过邀请码的形式邀请成员
   * @param user 被邀请人
   * @param inviteCode 邀请码，由 房间ID 和 邀请人ID 加密构成
   */
  async inviteMemberByCode(user: UserTokenEntity, inviteCode: string) {
    const [roomId] = decryptPrivateInfo(inviteCode).split('-')
    if (await this.isAlreadyInRoom(user.userId, roomId)) {
      throw new BadRequestException('您已经在群聊中了，无需重新加入群聊')
    }

    try {
      await this.chatRoomModel.updateOne(
        { _id: roomId },
        {
          $push: {
            members: user.userId || ''
          }
        }
      )
      this.response = getSuccessResponse('成员已加入群聊', 'ok')
      return this.response
    } catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

  /**
   * @description 移除群聊中的某个用户，仅限管理员移除或本人退出
   * @param user
   * @param roomId
   * @param userId
   * @returns
   */
  async removeMember(user: UserTokenEntity, roomId: string, userId: string) {
    const findRoom = await this.findRoomById(roomId)
    // 非群聊创建者 或 移除的用户非本人，无权限
    if (findRoom.creator !== new mongoose.Types.ObjectId(user.userId) && user.userId !== userId) {
      throw new UnauthorizedException('无删除权限，请联系管理员授予')
    }

    // 聊天室内没有该用户
    const isUserInRoom = findRoom.members.includes(new mongoose.Types.ObjectId(userId))
    if (!isUserInRoom) {
      throw new BadRequestException('该用户未加入当前聊天室')
    }

    try {
      const res = await this.chatRoomModel.updateOne(
        { _id: roomId },
        { $pull: { members: userId } }
      )
      this.response = getSuccessResponse('用户移除成功', userId)
      return this.response
    } catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

  async getMemberIds(roomId: string) {
    try {
      const findRoom = await this.findRoomById(roomId)
      return findRoom.members
    } catch {
      return []
    }
  }
  /**
   * @description 获取聊天室成员列表
   * @param roomId
   * @returns
   */
  async getMembers(roomId: string) {
    try {
      const memeberIds = await this.getMemberIds(roomId)
      const findUsers = await this.userService.findUsersByIds(memeberIds)
      this.response = getSuccessResponse('成员列表获取成功', findUsers)
      return this.response
    } catch (err) {
      throw new InternalServerErrorException(err)
    }
  }
}
