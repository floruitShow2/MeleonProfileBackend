import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef
} from '@nestjs/common'
import mongoose, { Model, Mongoose } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { formatToDateTime } from '@/utils/time'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { genStoragePath } from '@/utils/format'
import { isObjectId, isUndefined } from '@/utils/is'
import { genFileType } from '@/utils/file'
import { UserService } from '@/modules/user/user.service'
import { ChatRoomService } from '@/modules/chat-room/chat-room.service'
import {
  ChatMessageEntity,
  ChatMessageInput,
  ChatMessagePagingInput,
  ChatMessageResponseEntity
} from './dto/chat-message.dto'
import { MessageTypeEnum } from '@/constants'
import { ChatMessageGateway } from './chat-message.gateway'
import { UserEntity } from '../user/dto/user.dto'

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectModel(ChatMessageEntity.name)
    private readonly chatMessageModel: Model<ChatMessageEntity>,
    @Inject(forwardRef(() => ChatMessageGateway))
    private chatMessageGateway: ChatMessageGateway,
    private readonly chatRoomService: ChatRoomService,
    private readonly userService: UserService
  ) {}

  /**
   * @description 根据消息ID查询某一条数据
   * @param messageId
   * @returns
   */
  async findMessageById(messageId: string): Promise<ChatMessageResponseEntity> {
    const targetId = isObjectId(messageId) ? messageId : new mongoose.Types.ObjectId(messageId)
    try {
      const res = await this.chatMessageModel.aggregate([
        {
          $match: {
            _id: targetId
          }
        },
        {
          $addFields: {
            profileObjectId: {
              $toObjectId: '$profileId'
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            foreignField: '_id',
            localField: 'profileObjectId',
            as: 'profile'
          }
        },
        {
          $unwind: '$profile'
        },
        {
          $addFields: {
            messageId: '$_id',
            'profile.userId': '$profile._id'
          }
        },
        {
          $project: {
            _id: 0,
            __v: 0,
            profileId: 0,
            profileObjectId: 0,
            'profile._id': 0,
            'profile.__v': 0,
            'profile.salt': 0,
            'profile.role': 0,
            'profile.password': 0,
            'profile.certification': 0
          }
        }
      ])
      if (res && res.length) {
        return res[0]
      } else {
        throw new BadRequestException('该条消息已被删除')
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  /**
   * @description 根据聊天室ID，按时间顺序[倒序]，分页查询聊天记录
   */
  async findMessagesByPages(userId: string, pagingInput: ChatMessagePagingInput) {
    const { roomId, page, pageSize } = pagingInput
    const skip = (page - 1) * pageSize
    const limit = pageSize

    try {
      const messages = await this.chatMessageModel.aggregate([
        {
          $match: {
            roomId,
            visibleUsers: {
              $in: [new mongoose.Types.ObjectId(userId)]
            }
          }
        },
        {
          $sort: {
            createTime: -1
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $addFields: {
            profileObjectId: {
              $toObjectId: '$profileId'
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            foreignField: '_id',
            localField: 'profileObjectId',
            as: 'profile'
          }
        },
        {
          $unwind: '$profile'
        },
        {
          $addFields: {
            messageId: '$_id',
            'profile.userId': '$profile._id'
          }
        },
        { $sort: { createTime: 1 } },
        {
          $project: {
            _id: 0,
            __v: 0,
            profileId: 0,
            profileObjectId: 0,
            'profile._id': 0,
            'profile.__v': 0,
            'profile.salt': 0,
            'profile.role': 0,
            'profile.password': 0,
            'profile.certification': 0
          }
        }
      ])
      return getSuccessResponse<ChatMessageEntity[]>('消息查询成功', messages)
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  /**
   * @description 创建新消息
   * @param chatMessageInput 消息实体的部分内容
   * @returns
   */
  async createMessage(chatMessageInput: ChatMessageInput): Promise<ChatMessageResponseEntity> {
    const { profileId, roomId, createTime, type, content, url } = chatMessageInput
    try {
      const data = {
        roomId,
        profileId,
        metions: [],
        visibleUsers: await this.chatRoomService.getMemberIds(String(roomId)),
        createTime: isUndefined(createTime)
          ? formatToDateTime(new Date())
          : formatToDateTime(createTime),
        type,
        content,
        url
      }
      const res = await this.chatMessageModel.create(data)
      const saveRes = await res.save()
      return await this.findMessageById(saveRes._id)
    } catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

  /**
   * @description 用户上传文件后，生成 Message.Entity 格式
   * @param roomId
   * @param userId
   * @param files
   */
  async createFileMessage(
    roomId: string,
    userId: string,
    files: Express.Multer.File[]
  ): Promise<ChatMessageResponseEntity[]> {
    const chatMessageInputs = files.map((file) => {
      const { storagePath } = genStoragePath(`${userId}/${file.filename}`)

      return {
        roomId: new mongoose.Types.ObjectId(roomId),
        profileId: new mongoose.Types.ObjectId(userId),
        createTime: undefined,
        type: genFileType(file),
        content: file.filename,
        url: storagePath
      }
    })

    try {
      const res = await Promise.all(chatMessageInputs.map((msg) => this.createMessage(msg)))
      return res
    } catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

  /**
   * @description 撤回消息
   * @param userId 用户id，撤回操作仅限本人及群聊管理员
   * @param messageId
   */
  async recallMessage(userId: string, messageId: string) {
    try {
      const message = await this.findMessageById(messageId)
      if (message.profile.userId.toString() !== userId) {
        throw new BadRequestException('该条消息非本人发送，无法撤回')
      }

      const res = await this.chatMessageModel.updateOne(
        { _id: messageId },
        { $set: { visibleUsers: [] } }
      )

      const { matchedCount, modifiedCount } = res
      if (matchedCount >= 1 && modifiedCount === 1) {
        const profileId = new mongoose.Types.ObjectId(userId)
        const user = await this.userService.findUsersByIds([profileId])
        const newRecallMsg = await this.createMessage({
          roomId: message.roomId,
          profileId,
          createTime: message.createTime,
          type: MessageTypeEnum.ACTION,
          content: `${user[0].username} 撤回了一条消息`,
          url: ''
        })
        this.chatMessageGateway.broadcastRecallMessage(message.roomId.toString(), messageId, [
          newRecallMsg
        ])

        return getSuccessResponse('撤回消息成功', message._id)
      } else {
        return getFailResponse('消息撤回失败', message._id)
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
  /**
   * @description 删除消息，
   * @param messageId
   */
  deleteMessage(messageId: string[]) {}

  /**
   * @description
   * @param userId
   * @param roomId
   */
  async clearMessagesRecord(userId: string, roomId: string) {
    try {
      await this.chatMessageModel.updateMany({ roomId }, { $pull: { visibleUsers: userId } })
      return getSuccessResponse('聊天记录已清除', null)
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
}
