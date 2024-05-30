import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import mongoose, { Model } from 'mongoose'
import { unlinkSync } from 'fs'
import { join } from 'path'
import { UserEntity } from '@/modules/user/dto/user.dto'
import { TeamService } from '@/modules/team/team.service'
import { LoggerService } from '@/modules/logger/logger.service'
import { getFailResponse, getSuccessResponse } from '@/utils/service/response'
import { genStoragePath } from '@/utils/format'
import { TaskEntity } from './dto/task.dto'
import type { UserTokenEntity } from '@/modules/user/interface/user.interface'
import type { ApiResponse } from '@/interface/response.interface'
import type { TaskSearchOptions } from './interface/task.interface'

@Injectable()
export class TaskService {
  private response: ApiResponse
  constructor(
    @InjectModel(TaskEntity.name) private readonly taskModel: Model<TaskEntity>,
    private readonly teamService: TeamService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {}

  async findTaskById(taskId: string): Promise<TaskEntity[]> {
    return await this.taskModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(taskId)
        }
      }
    ])
  }

  /**
   * @description 创建新任务
   * @param user
   * @param task 任务实体
   * @returns
   */
  async createTask(user: UserTokenEntity, task: TaskEntity) {
    try {
      // 将关联用户的用户名替换为对应模型的 objectId
      // const users = await this.userModel.find({ username: { $in: task.relatives } })
      // task.relatives = users.map((user) => user._id.toString())
      task.relatives = []

      if (!task.teamId) delete task.teamId
      const createdTask = await this.taskModel.create(task)
      await createdTask.save()

      // 处理 teamId，如果存在该值，则需要将新建的任务ID赋值到 tasks 中
      await this.teamService.updateTeamTasks(user, createdTask.teamId, createdTask._id.toString())

      this.response = getSuccessResponse('任务创建成功', createdTask.title)
      this.logger.info('/task/createTask', `${user.username}新建任务：${createdTask.title}`)
    } catch (err) {
      this.response = getFailResponse('任务创建失败', null)
      this.logger.error(
        '/task/createTask',
        `${user.username}创建任务 ${task.title} 失败, 失败原因：${err}`
      )
    }

    return this.response
  }

  // 获取所有任务
  async getAllTasks(user: UserTokenEntity, options: TaskSearchOptions) {
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
          // 筛选条件过滤
          {
            $match: {
              title: { $regex: options.title, $options: 'i' },
              ...dateOptions
            }
          },
          // _id => taskId
          {
            $addFields: {
              taskId: { $toString: '$_id' },
              teamObjectId: { $toObjectId: '$teamId' }
            }
          },
          // 联表查询
          {
            $lookup: {
              from: 'users',
              foreignField: '_id',
              localField: 'relatives',
              as: 'userDetails'
            }
          },
          {
            $lookup: {
              from: 'comments',
              foreignField: 'targetId',
              localField: 'taskId',
              as: 'commentsList'
            }
          },
          {
            $lookup: {
              from: 'teams',
              foreignField: '_id',
              localField: 'teamObjectId',
              as: 'teamDetails'
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
              teams: {
                $map: {
                  input: '$teamDetails',
                  as: 'team',
                  in: {
                    teamName: '$$team.teamName',
                    logo: '$$team.logo',
                    teamId: '$teamId'
                  }
                }
              },
              comments: { $size: '$commentsList' },
              teamId: 1,
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
        // task.coverImage =
        //   task.coverImage &&
        //   `data:image/png;base64,${readFileSync(task.coverImage).toString('base64')}`
        // task.attachments = task.attachments.map((filePath) => {
        //   return filePath.split('\\').at(-1)
        // })
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
      this.logger.error('/task/getAllTasks', `查询任务行为失败，失败原因：${error}`)
    }

    return this.response
  }

  async updateTaskEntity(user: UserTokenEntity, taskId: string, task: Partial<TaskEntity>) {
    try {
      const res = await this.taskModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(taskId)
        },
        {
          $set: task
        }
      )

      const { matchedCount, modifiedCount } = res
      if (matchedCount >= 1 && modifiedCount === 1) {
        this.response = getSuccessResponse('任务信息更新成功', taskId)
        this.logger.info('/task/updateTask', `${user.username}更新用户信息成功，任务ID: ${taskId}`)
      } else {
        this.response = getFailResponse('任务信息更新失败', null)
        this.logger.info('/task/updateTask', `${user.username}更新任务信息失败，任务ID: ${taskId}`)
      }
    } catch (err) {
      this.response = getFailResponse('任务信息更新失败', null)
      this.logger.info(
        '/task/updateTask',
        `${user.username}更新任务信息失败，任务ID: ${taskId}，失败原因：${err}`
      )
    }

    return this.response
  }

  async handleAddCover(user: UserTokenEntity, taskId: string, task: Partial<TaskEntity>) {
    try {
      await this.updateTaskEntity(user, taskId, task)
      this.response = getSuccessResponse('封面新增成功', task.coverImage)
    } catch {
      this.response = getFailResponse('封面新增失败', '')
    }

    return this.response
  }

  async handleDeleteCover(user: UserTokenEntity, taskId: string) {
    try {
      const tasks = await this.findTaskById(taskId)
      if (tasks && tasks.length) {
        const { coverImage } = tasks[0]
        /**
         * @fix genStoragePath 生成存储路径时，附带了文件名，导致创建了以 文件名 命名的空文件夹，unlinkSync 只能删除文件，不能删除文件夹
         * @fix url.resolve 生成路径时会把路径中的空格替换为 %20 ，导致找不到对应文件
         */
        const folders = coverImage
          .replace(`${this.configService.get('NEST_APP_URL')}/static/files`, '')
          .split('/')
        const filename = folders.pop()
        const { diskPath } = genStoragePath(join(...folders))
        unlinkSync(join(diskPath, filename))
        await this.updateTaskEntity(user, taskId, { coverImage: '' })

        this.response = getSuccessResponse('封面删除成功', true)
        this.logger.info('/file/deleteCover', `${user.username}删除任务${taskId}的封面，执行成功`)
      }
    } catch (err) {
      this.response = getSuccessResponse('封面删除失败', false)
      this.logger.info(
        '/file/deleteCover',
        `${user.username}删除任务${taskId}的封面，执行失败，失败原因：${err}`
      )
    }
  }
}
