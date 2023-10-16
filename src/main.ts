import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WsAdapter } from '@nestjs/platform-ws'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

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
    // 启用特定级别的日志服务
    logger: ['warn', 'error'],
    cors: true
  })

  initSwagger(app)
  app.setGlobalPrefix('api')
  app.useWebSocketAdapter(new WsAdapter(app))
  app.enableShutdownHooks()

  await app.listen(3000)
}
bootstrap()
