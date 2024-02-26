import { SchemaFactory } from '@nestjs/mongoose'
import { BlogEntity } from '@/modules/blog/DTO/blog.dto'

export const BlogSchema = SchemaFactory.createForClass(BlogEntity)
