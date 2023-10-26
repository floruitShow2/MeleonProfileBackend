import { Module } from '@nestjs/common'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import TaskEntity from '@/dtos/task.dto'
import { MongooseModule } from '@nestjs/mongoose'
import { TaskSchema, UserSchema } from '../mongo/schema'
import { LoggerService } from '../logger/logger.service'
import { UserEntity } from '@/interface/user.interface'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskEntity.name, schema: TaskSchema, collection: 'tasks' },
      { name: UserEntity.name, schema: UserSchema, collection: 'users' }
    ])
  ],
  providers: [TaskService, LoggerService],
  controllers: [TaskController]
})
export class TaskModule {}
