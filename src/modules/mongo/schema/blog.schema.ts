import { SchemaFactory } from '@nestjs/mongoose'
import { BlogEntity } from '@/modules/blog/dto/blog.dto'

export const BlogSchema = SchemaFactory.createForClass(BlogEntity)
