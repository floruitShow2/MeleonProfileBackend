import { Controller, Get, Query } from '@nestjs/common'
import { AppService } from './app.service'
// import { RedisService } from './modules/redis/redis.service'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly redisService: RedisService
  ) {}

  // @Get('/registerPos')
  // async registerPos(
  //   @Query('name') posName: string,
  //   @Query('longitude') lng: number,
  //   @Query('latitude') lat: number
  // ) {
  //   return this.redisService.geoAdd('positions', posName, [lng, lat])
  // }
}
