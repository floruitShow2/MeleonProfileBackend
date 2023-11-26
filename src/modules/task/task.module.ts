import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TaskSchema, UserSchema } from '../mongo/schema'
import { UserEntity } from '@/modules/user/dto/user.dto'
import TaskEntity from './dto/task.dto'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskEntity.name, schema: TaskSchema, collection: 'tasks' },
      { name: UserEntity.name, schema: UserSchema, collection: 'users' }
    ])
  ],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TaskModule {}
