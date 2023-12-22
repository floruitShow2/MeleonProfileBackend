import { Module } from '@nestjs/common'
import { createClient } from 'redis'
import { RedisService } from './redis.service'

@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const client = createClient({
          socket: {
            host: 'localhost',
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
      }
    }
  ],
  exports: [RedisService]
})
export class RedisModule {}
