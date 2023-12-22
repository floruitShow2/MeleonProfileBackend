import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { INestApplication, ValidationPipe } from '@nestjs/common'

// swagger 文档服务
function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Meleon Blog')
    .setDescription('APIs documentation for Meleon Blog Admin based on RESTful style')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api', app, document)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
    cors: true
  })

  initSwagger(app)
  // 添加全局 api 前缀
  app.setGlobalPrefix('api')
  app.useWebSocketAdapter(new IoAdapter(app))
  // app.useGlobalPipes(new ValidationPipe())
  app.enableShutdownHooks()
  app.enableCors()

  await app.listen(3000)
}
bootstrap()
