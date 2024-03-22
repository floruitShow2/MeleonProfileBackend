import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    UserModule,
    HttpModule.register({
      timeout: 30000
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
