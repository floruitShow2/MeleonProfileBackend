import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
  Query,
  UploadedFile
} from '@nestjs/common'
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import { join } from 'path'
import { diskStorage } from 'multer'
import { TaskService } from './task.service'
import { formatToDateTime } from '@/utils/time'
import { genStoragePath } from '@/utils/format'
import { TaskEntity, TaskSearchOptions } from './dto/task.dto'
import { UserTokenEntity } from '../user/dto/user.dto'

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
    if (files.cover) task.coverImage = genStoragePath(join(storagePath, `/cover/${files.cover[0].originalname}`)).storagePath
    task.attachments = (files.attachments || []).map(
      (file) => genStoragePath(join(storagePath, `/attachments/${file.originalname}`)).storagePath
    )

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

  /**
   * @description 已有任务存在的情况下，上传任务封面
   * @return url 文件存储路径
   */
  @Post('/addCover')
  @UseInterceptors(FileInterceptor('cover', {
    storage: diskStorage({
      destination: function (req, res, cb) {
        const { diskPath } = genStoragePath(`/${req['user'].username}/task/${res.fieldname}`)
        cb(null, diskPath)
      },
      filename: function (req, res, cb) {
        cb(null, res.originalname)
      }
    })
  }))
  addCover(@Req() req: Request, @UploadedFile() cover: Express.Multer.File, @Body() taskId: string) {
    const user: UserTokenEntity = req['user']
    const { username } = user
    const { storagePath } = genStoragePath(`${username}/task/${cover.fieldname}`)
    return this.taskService.updateTaskEntity(req['user'], taskId, { coverImage: storagePath })
  }

  // 删除删除封面
  @Post('/deleteCover')
  deleteCover(@Req() req: Request, taskId: string) {
    return this.taskService.handleDeleteCover(req['user'], taskId)
  }

  // 上传任务附件
}
