import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import mongoose, { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { formatToDateTime } from '@/utils/time'
import { ChatMessageEntity, ChatMessageInput, ChatMessagePagingInput } from './dto/chat-message.dto'
import { getSuccessResponse } from '@/utils/service/response'
import { ApiResponse } from '@/interface/response.interface'

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectModel(ChatMessageEntity.name) private readonly chatMessageModel: Model<ChatMessageEntity>
  ) {}

  /**
   * @description 根据消息ID查询某一条数据
   * @param messageId
   * @returns
   */
  async findMessageById(messageId: string): Promise<ChatMessageEntity> {
    try {
      const res = await this.chatMessageModel.aggregate([
        {
          $match: {
            _id: messageId
          }
        },
        {
          $addFields: {
            messageId: '$_id'
          }
        },
        {
          $project: {
            _id: 0,
            __v: 0
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
  async findMessagesByPages(pagingInput: ChatMessagePagingInput) {
    const { roomId, page, pageSize } = pagingInput
    const skip = (page - 1) * pageSize
    const limit = pageSize

    try {
      const messages = await this.chatMessageModel.aggregate([
        {
          $match: {
            roomId: new mongoose.Types.ObjectId(roomId)
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
            messageId: '$_id'
          }
        },
        {
          $project: {
            _id: 0,
            __v: 0
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
  async createMessage(chatMessageInput: ChatMessageInput): Promise<ChatMessageEntity> {
    const { profileId, roomId, type, content, url } = chatMessageInput
    try {
      const data = {
        roomId: new mongoose.Types.ObjectId(roomId),
        profileId: new mongoose.Types.ObjectId(profileId),
        metions: [],
        createTime: formatToDateTime(new Date()),
        type,
        content,
        url
      }
      const res = await this.chatMessageModel.create(data)
      const saveRes = await res.save()
      return await this.findMessageById(saveRes._id)
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}
