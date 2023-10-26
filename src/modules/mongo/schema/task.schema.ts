import TaskEntity from '@/dtos/task.dto'
import { SchemaFactory } from '@nestjs/mongoose'

export const TaskSchema = SchemaFactory.createForClass(TaskEntity)
