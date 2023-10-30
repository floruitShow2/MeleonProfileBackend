import { Controller, Get, HttpStatus, ParseArrayPipe, Query } from '@nestjs/common'
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
}
