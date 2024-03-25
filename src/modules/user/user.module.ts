import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { JwtConstants } from '@/constants'
import { UserSchema } from '@/modules/mongo/schema/user.schema'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserEntity } from './dto/user.dto'

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
  providers: [UserService, ConfigService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
