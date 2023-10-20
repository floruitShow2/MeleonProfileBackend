import { Module } from '@nestjs/common'
import { BlogService } from './blog.service'
import { BlogController } from './blog.controller'
import { LoggerService } from '../logger/logger.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Blog } from '@/interface/blog.interface'
import { BlogSchema } from '../mongo/schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])],
  providers: [BlogService, LoggerService],
  controllers: [BlogController]
})
export class BlogModule {}
