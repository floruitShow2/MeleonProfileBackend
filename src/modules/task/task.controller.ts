import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
  Query
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { diskStorage } from 'multer'
import { TaskService } from './task.service'
import { formatToDateTime } from '@/utils/time'
import TaskEntity, { TaskSearchOptions } from './dto/task.dto'

@Controller('task')
@ApiTags('Blogs')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post('/createTask')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'attachments',
          maxCount: 10
        },
        {
          name: 'cover',
          maxCount: 1
        }
      ],
      {
        storage: diskStorage({
          destination: function (req, res, cb) {
            const storagePath = join(
              __dirname,
              `../../../filesStorage/${req['user'].username}/task/${res.fieldname}`
            )
            if (!existsSync(storagePath)) mkdirSync(storagePath, { recursive: true })
            cb(null, storagePath)
          },
          filename: function (req, res, cb) {
            cb(null, res.originalname)
          }
        })
      }
    )
  )
  createTask(
    @UploadedFiles() files: { cover?: Express.Multer.File; attachments?: Express.Multer.File[] },
    @Body('data') data: string,
    @Req() req: Request
  ) {
    const user = req['user']
    const creator = user.username
    const createTime = formatToDateTime(new Date())
    const storagePath = join(__dirname, `../../../filesStorage/${creator}/task/`)
    const task: TaskEntity = JSON.parse(data)

    // 补全前端提供的数据
    task.creator = creator
    task.createTime = createTime
    task.lastUpdateTime = createTime
    task.relatives = [...task.relatives, creator]
    if (files.cover) task.coverImage = storagePath + 'cover\\' + files.cover[0].originalname
    task.attachments = (files.attachments || []).map(
      (file) => storagePath + 'attachments\\' + file.originalname
    )

    return this.taskService.createTask(user, task)
  }

  @Get('/getAllTasks')
  getAllTasks(@Req() req: Request, @Query() options: TaskSearchOptions) {
    const user = req['user']
    return this.taskService.getAllTasks(user, options)
  }
}
