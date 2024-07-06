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
  ChatMessageLocatedInput,
  ChatMessagePagingInput,
  ChatMessageResponseEntity
} from './dto/chat-message.dto'
import { MessageTypeEnum } from '@/constants'
import { ChatMessageGateway } from './chat-message.gateway'

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
  async findMessageById(
    messageId: string | mongoose.Types.ObjectId
  ): Promise<ChatMessageResponseEntity> {
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
      const messages: ChatMessageResponseEntity[] = await this.chatMessageModel.aggregate([
        {
          $match: {
            roomId: isObjectId(roomId) ? roomId : new mongoose.Types.ObjectId(roomId),
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

      const newMessages = await Promise.all(
        messages.map(async (msg) => {
          const targetReplyMsg = msg.replyId ? await this.findMessageById(msg.replyId) : null
          msg.replyMessage = targetReplyMsg
          
          if (targetReplyMsg) {
            const isVisible = targetReplyMsg.visibleUsers.some(id => id.toString() === userId)
            msg.replyMessage.content = isVisible ? targetReplyMsg.content : '已撤回'
          }
          
          delete msg.replyId
          return msg
        })
      )
      return getSuccessResponse('消息查询成功', newMessages)
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  async findMessageLocatedPage(locatedInput: ChatMessageLocatedInput) {
    const { roomId, messageId, pageSize } = locatedInput
    try {
      const targetMessage = await this.findMessageById(messageId)
      const { createTime } = targetMessage
      const newMessagesCount = await this.chatMessageModel
        .countDocuments({
          roomId,
          createTime: { $gt: createTime }
        })
        .exec()
      return getSuccessResponse('获取消息分页成功', Math.floor(newMessagesCount / pageSize) + 1)
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  /**
   * @description 递归向前查询，某条消息的完整的回复链路
   * @param messageId
   * @returns
   */
  async findReplyMessageChain(userId: string, messageId: string) {
    try {
      const targetMessage = await this.findMessageById(messageId)
      const messagesgsChain: ChatMessageResponseEntity[] = [targetMessage]

      while (messagesgsChain[0] && messagesgsChain[0].replyId) {
        const replyMessage = await this.findMessageById(messagesgsChain[0].replyId)
        const isVisible = replyMessage.visibleUsers.some(id => id.toString() === userId)
        if (!isVisible) break
        messagesgsChain.unshift(replyMessage)
      }

      return getSuccessResponse('回复列表查询成功', messagesgsChain)
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
    const { profileId, roomId, replyId, createTime, type, content, url } = chatMessageInput
    try {
      if (!roomId || !profileId) {
        throw new BadRequestException('roomId和profileId不能为空')
      }
      const finalReplyId =
        isObjectId(replyId) || !replyId ? replyId : new mongoose.Types.ObjectId(replyId)

      const data = {
        roomId: isObjectId(roomId) ? roomId : new mongoose.Types.ObjectId(roomId),
        profileId: isObjectId(profileId) ? profileId : new mongoose.Types.ObjectId(profileId),
        replyId: finalReplyId,
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
      const resultMsg = await this.findMessageById(saveRes._id)
      resultMsg.replyMessage = resultMsg.replyId
        ? await this.findMessageById(resultMsg.replyId)
        : null
      delete resultMsg.replyId
      return resultMsg
    } catch (err) {
      throw new InternalServerErrorException(err)
    }
  }

  async handleCreateMessage(chatMessageInput: ChatMessageInput) {
    try {
      const newMessage = await this.createMessage(chatMessageInput)
      this.chatMessageGateway.broadcastMessage(chatMessageInput.roomId.toString(), [newMessage])
      return getSuccessResponse('消息发送成功', newMessage)
    } catch (err) {
      throw new InternalServerErrorException(err.message)
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
