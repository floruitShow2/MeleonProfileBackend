import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'
import { EncryptPrivateInfo, DecryptPrivateInfo } from './utils/encrypt'

// swagger 文档服务
function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Meleon Blog')
    .setDescription('APIs documentation for Meleon Blog Admin based on RESTful style')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: true })

  SwaggerModule.setup('api', app, document)
}

async function bootstrap() {
  /**
   * @fix 在部署时，保留 { logger: false, cors: true } 参数会导致项目运行不起来，原因未知，暂时注释掉
   */
  // const app = await NestFactory.create(AppModule, {
  //   logger: false,
  //   cors: true
  // })
  const app = await NestFactory.create(AppModule)

  console.log(EncryptPrivateInfo('VeABLirfs82vjAjqi5C9iFZf8wBnMl'))

  initSwagger(app)
  // 添加全局 api 前缀
  app.setGlobalPrefix('api')
  app.useWebSocketAdapter(new IoAdapter(app))
  // app.useGlobalInterceptors(new LoggerInterceptor(new LoggerService()))
  // app.useGlobalPipes(new ValidationPipe())
  app.enableShutdownHooks()
  app.enableCors()

  await app.listen(3000, () => {
    console.log('成功监听了 3000 端口')
  })
}

bootstrap()
