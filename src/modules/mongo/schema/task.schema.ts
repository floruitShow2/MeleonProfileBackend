import { TaskEntity } from '@/modules/task/DTO/task.dto'
import { SchemaFactory } from '@nestjs/mongoose'

export const TaskSchema = SchemaFactory.createForClass(TaskEntity)
