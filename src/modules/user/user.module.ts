import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from '@/modules/mongo/schema/user.schema'
import { User } from '@/interface/user.interface'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { LoggerService } from '@/modules/logger/logger.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UserService, LoggerService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
