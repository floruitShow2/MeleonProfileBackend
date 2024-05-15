declare namespace Express {
  import { UserTokenEntity } from './modules/user/interface/user.interface'

  export interface Request {
    user?: UserTokenEntity
  }
}
