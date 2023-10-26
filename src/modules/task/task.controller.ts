import { Body, Controller, Get, Post, Req, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { TaskService } from './task.service'
import TaskEntity from '@/dtos/task.dto'
import { diskStorage } from 'multer'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { formatToDateTime } from '@/utils/time'

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post('/createTask')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: function (req, res, cb) {
          const storagePath = join(__dirname, `../../files/${req['user'].username}/task`)
          if (!existsSync(storagePath)) mkdirSync(storagePath, { recursive: true })
          cb(null, storagePath)
        },
        filename: function (req, res, cb) {
          cb(null, res.originalname)
        }
      })
    })
  )
  createTask(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('data') data: string,
    @Req() req: Request
  ) {
    const creator = req['user'].username
    const createTime = formatToDateTime(new Date())
    const storagePath = join(__dirname, `../../files/${creator}/task/`)
    const task: TaskEntity = JSON.parse(data)

    // 补全前端提供的数据
    task.creator = creator
    task.createTime = createTime
    task.lastUpdateTime = createTime
    task.relatives = [...task.relatives, creator]
    task.attachments = files.map((file) => storagePath + file.originalname)

    return this.taskService.createTask(task)
  }

  @Get('/getAllTasks')
  getAllTasks(@Req() req: Request) {
    const user = req['user']
    return this.taskService.getAllTasks(user.userId, user.username)
  }
}
