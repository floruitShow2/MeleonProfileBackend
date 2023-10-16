import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import * as Joi from 'joi'
import { CryptoMiddleware } from '@/middlewares'
import { EventsModule } from '@/gateway/events.module'
import { HttpExceptionFilter } from '@/filters/exception/exception.filter'
import GlobalConfig from '@/config/global.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import {
  MongoModule,
  LoggerModule,
  UserModule,
  AuthModule,
  FileModule,
  HelloModule
} from './modules'

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
    UserModule,
    AuthModule,
    EventsModule,
    FileModule,
    HelloModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
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
