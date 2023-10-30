import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { LoggerService } from '@/modules/logger/logger.service'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('error', exception)
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()
    const status = exception.getStatus()

    this.logger.error(
      null,
      JSON.stringify({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url
      })
    )

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url
    })
  }
}
