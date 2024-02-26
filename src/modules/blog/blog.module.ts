import { Module } from '@nestjs/common'
import { BlogService } from './blog.service'
import { BlogController } from './blog.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { BlogEntity } from './DTO/blog.dto'
import { BlogSchema } from '../mongo/schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogEntity.name, schema: BlogSchema, collection: 'blogs' }])
  ],
  providers: [BlogService],
  controllers: [BlogController]
})
export class BlogModule {}
