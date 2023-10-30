import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from '@/modules/mongo/schema/user.schema'
import { UserEntity } from './dto/user.dto'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { LoggerService } from '@/modules/logger/logger.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema, collection: 'users' }])
  ],
  providers: [UserService, LoggerService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
