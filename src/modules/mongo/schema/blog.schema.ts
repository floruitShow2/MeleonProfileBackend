import { SchemaFactory } from '@nestjs/mongoose'
import { Blog } from '@/interface/blog.interface'

export const BlogSchema = SchemaFactory.createForClass(Blog)
