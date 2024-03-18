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
import { diskStorage } from 'multer'
import { TaskService } from './task.service'
import { formatToDateTime } from '@/utils/time'
import { genStoragePath } from '@/utils/format'
import { TaskEntity, TaskSearchOptions } from './dto/task.dto'

@Controller('task')
@ApiTags('Blogs')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

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
            const { diskPath } = genStoragePath(`/${req['user'].username}/task/${res.fieldname}`)
            cb(null, diskPath)
          },
          filename: function (req, res, cb) {
            cb(null, res.originalname)
          }
        })
      }
    )
  )
  createTask(
    @Req() req: Request,
    @Body('data') data: string,
    @UploadedFiles() files: { cover?: Express.Multer.File; attachments?: Express.Multer.File[] }
  ) {
    const user = req['user']
    const creator = user.username
    const createTime = formatToDateTime(new Date())
    const storagePath = `${creator}/task/`
    const task: TaskEntity = JSON.parse(data)

    // 补全前端提供的数据
    task.creator = creator
    task.createTime = createTime
    task.lastUpdateTime = createTime
    task.relatives = [...task.relatives, creator]
    console.log(genStoragePath(join(storagePath, `/cover/${files.cover[0].originalname}`)))
    if (files.cover) task.coverImage = genStoragePath(join(storagePath, `/cover/${files.cover[0].originalname}`)).storagePath
    task.attachments = (files.attachments || []).map(
      (file) => genStoragePath(join(storagePath, `/attachments/${file.originalname}`)).storagePath
    )
    console.log(task)

    return this.taskService.createTask(user, task)
  }

  @Get('/getAllTasks')
  getAllTasks(@Req() req: Request, @Query() options: TaskSearchOptions) {
    const user = req['user']
    return this.taskService.getAllTasks(user, options)
  }

  @Post('/updateTask')
  updateTask(@Req() req: Request, @Body() data: { taskId: string, taskEntity: TaskEntity }) {
    const { taskId, taskEntity } = data
    return this.taskService.updateTaskEntity(req['user'], taskId, taskEntity)
  }
}
