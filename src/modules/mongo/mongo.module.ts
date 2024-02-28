import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        /**
         * @remark jenkins 上传项目代码时，.env 文件未被发送到服务器端，导致 ConfigService 没有生成响应的环境变量
         */
        const uri = configService.get<string>('NEST_MONGO_URL')
        console.log('mongodb 地址', uri)
        return { uri }
      },
      inject: [ConfigService]
    })
  ]
})
export class MongoModule {}
