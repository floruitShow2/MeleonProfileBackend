import { Inject, Injectable, Scope, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { INQUIRER } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'

@Injectable({
  scope: Scope.TRANSIENT
})
export class HelloService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(INQUIRER) private parentClass: object, private configService: ConfigService) {
    console.log(`${this.parentClass?.constructor?.name}`)
    console.log(this.configService.get<string>('mode', 'http://127.0.0.1'))
  }

  onModuleInit() {
    console.log('helloService has been initialized')
  }
  onModuleDestroy() {
    console.log('helloService has been destroyed')
  }
}
