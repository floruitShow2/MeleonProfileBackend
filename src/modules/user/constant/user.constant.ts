import { Role } from '@/constants/auth'

export const DefaultUserEntity = {
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
