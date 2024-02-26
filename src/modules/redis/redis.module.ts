import { Module } from '@nestjs/common'
import { createClient } from 'redis'
import { ConfigService } from '@nestjs/config'
import { RedisService } from './redis.service'

@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(configService: ConfigService) {
        const client = createClient({
          socket: {
            host: configService.get('HOST'),
            port: 6379
          }
        })

        // 连接 redis 操作可能会因为服务未启动等原因无法成功，最好用 try...catch... 包裹
        try {
          await client.connect()
        } catch (err) {
          console.log(err)
        }

        return client
      },
      inject: [ConfigService]
    }
  ],
  exports: [RedisService]
})
export class RedisModule {}
