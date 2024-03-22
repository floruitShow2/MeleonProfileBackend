import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import * as Joi from 'joi'
import { CryptoMiddleware } from '@/middlewares'
// import { EventsModule } from '@/gateway/events.module'
import { HttpExceptionFilter } from '@/filters/exception/exception.filter'
import GlobalConfig from '@/config/global.config'
// 模块
import {
  AuthModule,
  MongoModule,
  LoggerModule,
  UserModule,
  BlogModule,
  TaskModule,
  CommentModule,
  TagModule,
  RedisModule,
  FileModule,
  TeamModule
} from './modules'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { RolesGuard } from './guards/roles.guard'
import { isDev } from './utils/is'

const envFilePath = isDev() ? ['.env.development'] : ['.env.production']

@Module({
  imports: [
    // 环境变量配置
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      expandVariables: true,
      load: [GlobalConfig],
      validationSchema: Joi.object({
        NEST_APP_MODE: Joi.string()
          .valid('development', 'production', 'test')
          .default('development')
      }),
      validationOptions: {
        allowUnkonwn: false,
        abortEarly: true
      }
    }),
    // 静态资源
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '/public'),
      serveRoot: '/static'
    }),
    // 数据库连接
    MongoModule,
    // 日志服务
    LoggerModule,
    // 授权模块
    AuthModule,
    // 用户模块
    UserModule,
    // 任务管理模块
    TaskModule,
    // 评论模块
    CommentModule,
    // 博客模块
    BlogModule,
    // EventsModule,
    TagModule,
    RedisModule,
    // 文件模块
    FileModule,
    // 团队模块
    TeamModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CryptoMiddleware)
      .exclude(
        { path: 'user/signup', method: RequestMethod.POST },
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'static', method: RequestMethod.ALL }
      )
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL
      })
  }
}
