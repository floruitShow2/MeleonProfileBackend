import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { toObjectId } from '@/utils/is'
import { formatToDateTime } from '@/utils/time'
import { getSuccessResponse } from '@/utils/service/response'
import { CreateMessageInput, MessageEntity } from './dto/message.dto'

@Injectable()
export class MessageService {
  constructor(@InjectModel(MessageEntity.name) private messageModel: Model<MessageEntity>) {}

  async getMessageList(userId: string) {
    try {
      const res = await this.messageModel.aggregate([
        {
          $match: { receiver: toObjectId(userId) }
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

      return getSuccessResponse('消息列表查询成功', res)
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  async createMessage(message: CreateMessageInput) {
    try {
      const localMessage = {
        sender: toObjectId(message.sender),
        receiver: toObjectId(message.receiver),
        content: message.content,
        type: message.type,
        isRead: false,
        createdAt: formatToDateTime(Date.now())
      }
      const res = await this.messageModel.create(localMessage)
      await res.save()

      return getSuccessResponse('消息发送成功', res._id)
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
}
