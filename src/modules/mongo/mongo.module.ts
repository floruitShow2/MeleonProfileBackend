import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
// import { BlogSchema, UserSchema } from './schema'

// export const MONGO_MODELS = MongooseModule.forFeature([
//   {
//     name: 'USER_SCHEMA',
//     schema: UserSchema,
//     collection: 'users'
//   },
//   {
//     name: 'BLOG_SCHEMA',
//     schema: BlogSchema,
//     collection: 'blogs'
//   }
// ])

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('url')
        }
      },
      inject: [ConfigService]
    })
  ]
})
export class MongoModule {}
