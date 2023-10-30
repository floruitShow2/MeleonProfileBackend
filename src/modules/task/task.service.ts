import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { readFileSync } from 'fs'
import { UserEntity } from '@/modules/user/dto/user.dto'
import { ApiResponse } from '@/interface/response.interface'
import TaskEntity from './dto/task.dto'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class TaskService {
  private response: ApiResponse
  constructor(
    @InjectModel(TaskEntity.name) private readonly taskModel: Model<TaskEntity>,
    @InjectModel(UserEntity.name) private readonly userModel: Model<UserEntity>,
    private readonly logger: LoggerService
  ) {}

  // 创建新任务
  async createTask(task: TaskEntity) {
    try {
      // 将关联用户的用户名替换为对应模型的 objectId

      const users = await this.userModel.find({ username: { $in: task.relatives } })

      task.relatives = users.map((user) => user._id)
      const createdTask = await this.taskModel.create(task)
      await createdTask.save()
      this.response = {
        Code: 1,
        Message: '任务创建成功',
        ReturnData: createdTask
      }
      this.logger.info(null, `新建一条任务：${createdTask.id}`)
    } catch {
      this.response = {
        Code: -1,
        Message: '任务创建失败',
        ReturnData: null
      }
      this.logger.error(null, `任务创建失败`)
    }

    return this.response
  }

  // 获取所有任务
  async getAllTasks(userId: string, username: string) {
    try {
      const res = await this.taskModel
        .find(
          {
            relatives: { $in: [userId] },
            creator: username
          },
          { __v: 0 }
        )
        .populate({ path: 'relatives', select: 'username avatar -_id' })
        .exec()

      const map = new Map<string, TaskEntity[]>()

      res.forEach((task) => {
        task = task.toObject()
        const { group } = task
        // 处理任务ID
        task.taskId = task._id
        delete task._id
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

      this.logger.info(null, `${username}查询所有他的相关任务`)

      this.response = {
        Code: 1,
        Message: '查询成功',
        ReturnData: Array.from(map.keys()).map((key) => {
          return {
            group: key,
            list: map.get(key)
          }
        })
      }
    } catch (error) {
      this.logger.error(null, '查询任务行为失败')

      this.response = {
        Code: -1,
        Message: '查询任务失败',
        ReturnData: null
      }
    }

    return this.response
  }
}
