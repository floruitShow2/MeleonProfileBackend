import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { LoggerService } from '@/modules/logger/logger.service'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('error', exception)
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest() as Request

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    this.logger.error(
      `ExceptionFilter: ${request.url}`,
      JSON.stringify({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url
      })
    )

    response.status(status).json({
      Code: status,
      Message: exception.getResponse(),
      ReturnData: {
        timestamp: new Date().toISOString(),
        path: request.url
      }
    })
  }
}
