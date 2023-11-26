import { Test, TestingModule } from '@nestjs/testing'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

describe('TaskController', () => {
  let controller: TaskController

  beforeEach(async () => {
    const mockService = <TaskService>Object.getOwnPropertyNames(TaskService.prototype)
      .filter((name) => name !== 'constructor')
      .reduce((obj, func) => {
        obj[func] = () => void 0
        return obj
      }, {})

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockService
        }
      ]
    }).compile()

    controller = module.get<TaskController>(TaskController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
