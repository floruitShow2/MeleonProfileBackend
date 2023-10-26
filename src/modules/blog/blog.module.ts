import { Module } from '@nestjs/common'
import { BlogService } from './blog.service'
import { BlogController } from './blog.controller'
import { LoggerService } from '../logger/logger.service'
import { MongooseModule } from '@nestjs/mongoose'
import { BlogEntity } from '@/interface/blog.interface'
import { BlogSchema } from '../mongo/schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogEntity.name, schema: BlogSchema, collection: 'blogs' }])
  ],
  providers: [BlogService, LoggerService],
  controllers: [BlogController]
})
export class BlogModule {}
