import { SchemaFactory } from '@nestjs/mongoose'
import { BlogEntity } from '@/interface/blog.interface'

export const BlogSchema = SchemaFactory.createForClass(BlogEntity)
