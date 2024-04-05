import { Role } from '@/constants/auth'

export interface UserEntityDTO {
  username: string

  password: string

  avatar: string

  introduction: string

  email: string

  phone: string

  location: string

  role: Role

  socialAccounts: string[]

  job: string

  organization: string

  registrationDate: string

  certification: string

  userId?: string

  salt?: string
}

export type UserTokenEntity = Pick<UserEntityDTO, 'username' | 'userId' | 'role'>

export interface PasswordsType {
  oldPwd: string
  newPwd: string
  confirmPwd: string
}

export const DefaultUserEntity: UserEntityDTO = {
  username: '',

  password: '',

  avatar: '',

  email: '',

  job: '',

  organization: '',

  location: '',

  introduction: '',

  phone: '',

  registrationDate: '',

  certification: '',

  role: Role.User,

  socialAccounts: []
}
