import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import { genMongoConnection } from '@/utils/database'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        /**
         * @remark jenkins 上传项目代码时，.env 文件未被发送到服务器端，导致 ConfigService 没有生成响应的环境变量
         */
        console.log('base url of mongodb: ', genMongoConnection())
        return { uri: genMongoConnection() }
      },
      inject: [ConfigService]
    })
  ]
})
export class MongoModule {}
