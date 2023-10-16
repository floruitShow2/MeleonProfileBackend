import { Test } from '@nestjs/testing'
import { MongooseModule } from '@nestjs/mongoose'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { ApiResponse } from '@/interface/response.interface'
import { UserSchema } from '@/modules/mongo/schema/user.schema'
import { User } from '@/interface/user.interface'
import { LoggerService } from '../logger/logger.service'
import { JwtService } from '@nestjs/jwt'

describe('UserController', () => {
  let userController: UserController
  let userService: UserService
  let loggerService: LoggerService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, LoggerService, JwtService],
      imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])]
    }).compile()

    userService = moduleRef.get<UserService>(UserService)
    userController = moduleRef.get<UserController>(UserController)
    loggerService = moduleRef.get<LoggerService>(LoggerService)
  })

  describe('getUserInfo', () => {
    it('should return an array of cats', async () => {
      const result: ApiResponse<unknown> = {
        Code: 1,
        Message: 'ok',
        ReturnData: {}
      }
      jest
        .spyOn(userService, 'getUserInfo')
        .mockImplementation(() => new Promise((resolve) => resolve(result)))

      const mockRequest = {
        user: {
          username: 'meleon',
          password: '232000'
        }
      } as unknown as Request
      expect(await userController.getUserInfo(mockRequest)).toBe(result)
    })
  })
})
