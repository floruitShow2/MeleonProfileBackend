import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    HttpModule.register({
      timeout: 60000
    }),
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
