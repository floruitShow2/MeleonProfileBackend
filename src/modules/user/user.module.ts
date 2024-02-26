import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JwtModule } from '@nestjs/jwt'
import { JwtConstants } from '@/constants'
import { UserSchema } from '@/modules/mongo/schema/user.schema'
import { UserEntity } from './DTO/user.dto'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { LoggerService } from '@/modules/logger/logger.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema, collection: 'users' }]),
    JwtModule.register({
      global: true,
      secret: JwtConstants.secret,
      signOptions: {
        expiresIn: '7d'
      }
    })
  ],
  providers: [UserService, LoggerService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
