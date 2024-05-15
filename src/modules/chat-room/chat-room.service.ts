import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { LoggerService } from '@/modules/logger/logger.service'
import { UserService } from '@/modules/user/user.service'
import { UserTokenEntity } from '@/modules/user/interface/user.interface'
import { ApiResponse } from '@/interface/response.interface'
import { ChatRoomEntity, ChatRoomInput } from './dto/chat-room.dto'
import { formatToDateTime } from '@/utils/time'
import { getSuccessResponse } from '@/utils/service/response'
import { ConfigService } from '@nestjs/config'
import { MessageType } from '../chat-message/dto/chat-message.dto'

@Injectable()
export class ChatRoomService {
  private response: ApiResponse

  constructor(
    @InjectModel(ChatRoomEntity.name) private chatRoomModel: Model<ChatRoomEntity>,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService
  ) {}

  async createRoom(user: UserTokenEntity, chatRoomInput: ChatRoomInput) {
    const { userId } = user
    const createTime = formatToDateTime(new Date())

    console.log(userId)
    try {
      const res = await this.chatRoomModel.create({
        roomName: chatRoomInput.roomName,
        roomCover:
          chatRoomInput.roomCover ??
          `${this.configService.get('NEST_APP_URL')}/static/avatar/avatar_${
            Math.floor(Math.random() * 5) + 1
          }.png`,
        members: [userId],
        isPinned: false,
        noDisturbing: false,
        creator: new mongoose.Types.ObjectId(userId),
        createTime
      })
      await res.save()

      this.response = getSuccessResponse('房间创建成功', res._id.toString())
      return this.response
    } catch (err) {
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

      this.response = getSuccessResponse(
        '房间查询成功',
        res.map((room) => ({
          ...room,
          messages: [
            { message: { type: MessageType.TEXT, content: 'this is a message for testing' } }
          ]
        }))
      )
      return this.response
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }

  async findRoomById(roomId: string): Promise<ChatRoomEntity> {
    try {
        console.log(roomId)
        return await this.chatRoomModel.findOne({ _id: roomId })
    } catch (err) {
        console.log(err)
        throw new InternalServerErrorException()
    }
  }

  async deleteRoom(user: UserTokenEntity, roomId: string) {
    const targetRoom = await this.findRoomById(roomId)
    if (!targetRoom) throw new BadRequestException('Room not found')
    
    if (targetRoom.creator.toString() !== user.userId) throw new ForbiddenException('not authorized')
  
    try {
        await this.chatRoomModel.deleteOne({ _id: roomId })
        this.response = getSuccessResponse('聊天室删除成功', roomId)
        return this.response
    } catch(err) {
        console.log(err)
        throw new InternalServerErrorException()
    }
}
}
