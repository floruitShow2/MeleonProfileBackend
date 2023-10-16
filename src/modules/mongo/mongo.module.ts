import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import { UserSchema } from './schema/user.schema'

const MONGO_MODELS = MongooseModule.forFeature([
  {
    name: 'USER_SCHEMA',
    schema: UserSchema,
    collection: 'users'
  }
])

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('url')
        }
      },
      inject: [ConfigService]
    }),
    MONGO_MODELS
  ],
  exports: [MONGO_MODELS]
})
export class MongoModule {}
