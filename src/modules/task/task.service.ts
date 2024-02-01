import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { readFileSync } from 'fs'
import { UserEntity, UserTokenEntity } from '@/modules/user/dto/user.dto'
import { ApiResponse } from '@/interface/response.interface'
import TaskEntity, { TaskSearchOptions } from './dto/task.dto'
import { LoggerService } from '../logger/logger.service'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'

@Injectable()
export class TaskService {
  private response: ApiResponse
  constructor(
    @InjectModel(TaskEntity.name) private readonly taskModel: Model<TaskEntity>,
    @InjectModel(UserEntity.name) private readonly userModel: Model<UserEntity>,
    private readonly logger: LoggerService
  ) {}

  // 创建新任务
  async createTask(user: UserTokenEntity, task: TaskEntity) {
    try {
      // 将关联用户的用户名替换为对应模型的 objectId
      const users = await this.userModel.find({ username: { $in: task.relatives } })

      task.relatives = users.map((user) => user._id)
      const createdTask = await this.taskModel.create(task)
      await createdTask.save()
      this.response = getSuccessResponse('任务创建成功', createdTask.title)
      this.logger.info('/task/createTask', `${user.username}新建任务：${createdTask.title}`)
    } catch {
      this.response = getFailResponse('任务创建失败', null)
      this.logger.error('/task/createTask', `${user.username}创建任务 ${task.title} 失败`)
    }

    return this.response
  }

  // 获取所有任务
  async getAllTasks(user: { userId: string; username: string }, options: TaskSearchOptions) {
    const { userId, username } = user

    const { startDate, endDate } = options
    const dateOptions: Record<string, any> = {}
    if (startDate) dateOptions.startTime = { $gte: options.startDate }
    if (endDate) dateOptions.endTime = { $lte: options.endDate }

    try {
      const res = await this.taskModel
        .aggregate([
          // 查询与接口调用用户相关联的任务
          {
            $match: {
              $or: [{ relatives: { $in: [userId] } }, { creator: username }]
            }
          },
          {
            $match: {
              title: { $regex: options.title, $options: 'i' },
              ...dateOptions
            }
          },
          {
            $addFields: {
              taskId: '$_id'
            }
          },
          {
            $lookup: {
              from: 'users',
              foreignField: '_id',
              localField: 'relatives',
              as: 'userDetails'
            }
          },
          {
            $addFields: {
              _idStr: { $toString: '$_id' }
            }
          },
          {
            $lookup: {
              from: 'comments',
              foreignField: 'targetId',
              localField: '_idStr',
              as: 'commentsList'
            }
          },
          {
            $project: {
              taskId: 1,
              group: 1,
              title: 1,
              desc: 1,
              coverImage: 1,
              startTime: 1,
              endTime: 1,
              tags: 1,
              creator: 1,
              createTime: 1,
              lastUpdateTime: 1,
              relatives: {
                $map: {
                  input: '$userDetails',
                  as: 'user',
                  in: {
                    username: '$$user.username',
                    avatar: '$$user.avatar'
                  }
                }
              },
              comments: { $size: '$commentsList' },
              attachments: 1
            }
          },
          {
            $project: {
              _id: 0
            }
          }
        ])
        .exec()

      const map = new Map<string, TaskEntity[]>()

      res.forEach((task) => {
        const { group } = task
        // 处理附件内容
        task.coverImage =
          task.coverImage &&
          `data:image/png;base64,${readFileSync(task.coverImage).toString('base64')}`
        task.attachments = task.attachments.map((filePath) => {
          return filePath.split('\\').at(-1)
        })
        // 处理用户信息
        if (map.has(group)) {
          map.set(group, [...map.get(group), task])
        } else {
          map.set(group, [task])
        }
      })

      this.response = getSuccessResponse(
        '查询任务成功',
        Array.from(map.keys()).map((key) => {
          return {
            group: key,
            list: map.get(key)
          }
        })
      )
      this.logger.info('/task/getAllTasks', `${username}查询所有他的相关任务`)
    } catch (error) {
      this.response = getFailResponse('查询任务失败', null)
      this.logger.error('/task/getAllTasks', '查询任务行为失败')
    }

    return this.response
  }
}
