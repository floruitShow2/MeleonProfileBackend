import TaskEntity from '@/modules/task/dto/task.dto'
import { SchemaFactory } from '@nestjs/mongoose'

export const TaskSchema = SchemaFactory.createForClass(TaskEntity)
