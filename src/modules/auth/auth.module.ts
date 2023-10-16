import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'
import { JwtConstants } from '@/constants'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: JwtConstants.secret,
      signOptions: {
        expiresIn: '7d'
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
