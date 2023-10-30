import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import * as Joi from 'joi'
import { CryptoMiddleware } from '@/middlewares'
import { EventsModule } from '@/gateway/events.module'
import { HttpExceptionFilter } from '@/filters/exception/exception.filter'
import GlobalConfig from '@/config/global.config'
// 模块
import {
  MongoModule,
  LoggerModule,
  UserModule,
  AuthModule,
  BlogModule,
  TaskModule,
  CommentModule,
  TagModule,
  HelloModule
} from './modules'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { RolesGuard } from './guards/roles.guard'

const isDev = process.env.MODE === 'development'
const envFilePath = isDev ? ['.env.development'] : ['.env.production']

@Module({
  imports: [
    // 环境变量配置
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      expandVariables: true,
      load: [GlobalConfig],
      validationSchema: Joi.object({
        MODE: Joi.string()
          .valid('development', 'production', 'test')
          .required()
          .default('development')
      }),
      validationOptions: {
        allowUnkonwn: false,
        abortEarly: true
      }
    }),
    // 静态资源
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static'
    }),
    // 数据库连接
    MongoModule,
    // 日志服务
    LoggerModule,
    // 用户模块
    UserModule,
    // 任务管理模块
    TaskModule,
    // 评论模块
    CommentModule,
    AuthModule,
    EventsModule,
    BlogModule,
    TagModule,
    HelloModule
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
