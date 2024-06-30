import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TeamModule } from '@/modules/team/team.module'
import { UserEntity } from '@/modules/user/dto/user.dto'
import { TaskSchema, UserSchema } from '@/modules/mongo/schema'
import { TaskEntity } from './dto/task.dto'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TaskEntity.name, schema: TaskSchema, collection: 'tasks' }]),
    TeamModule
  ],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TaskModule {}
