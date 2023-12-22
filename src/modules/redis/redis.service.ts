import { Inject, Injectable } from '@nestjs/common'
import type { RedisClientType } from 'redis'

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType

  async geoAdd(key: string, posName: string, posLoc: [number, number]) {
    return await this.redisClient.geoAdd(key, {
      longitude: posLoc[0],
      latitude: posLoc[1],
      member: posName
    })
  }
}
