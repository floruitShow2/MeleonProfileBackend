import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common'
import { HelloService } from './hello.service'
import { ValidationPipe } from '@/pipe/validation.pipe'

@Controller('hello')
export class HelloController {
  constructor(private readonly hellowService: HelloService) {}

  @Get('/getHello')
  getHello(
    @Query('ids', new ValidationPipe())
    ids: number[]
  ) {
    console.log(ids)
  }

  @Get('/test')
  testExceptionFileter() {
    throw new HttpException({ message: 'This is a Forbidden Response' }, HttpStatus.FORBIDDEN)
  }
}
