import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TaskSchema, UserSchema } from '../mongo/schema'
import { TeamModule } from '@/modules/team/team.module'
import { UserEntity } from '@/modules/user/DTO/user.dto'
import { TaskEntity } from './DTO/task.dto'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskEntity.name, schema: TaskSchema, collection: 'tasks' },
      { name: UserEntity.name, schema: UserSchema, collection: 'users' }
    ]),
    TeamModule
  ],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TaskModule {}
