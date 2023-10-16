import { Controller } from '@nestjs/common'
import { HelloService } from './hello.service'

@Controller('hello')
export class HelloController {
  constructor(private readonly hellowService: HelloService) {}

  getHello() {
    console.log(this.hellowService)
  }
}
