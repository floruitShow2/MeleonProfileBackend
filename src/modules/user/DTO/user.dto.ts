import { Role } from '@/constants/auth'

export interface UserEntityDTO {
  username: string

  password: string

  avatar: string

  email: string

  job: string

  jobName: string

  organization: string

  organizationName: string

  location: string

  locationName: string

  introduction: string

  personalWebsite: string

  phone: string

  registrationDate: string

  accountId: string

  certification: number

  roles: Role[]
}

export const DefaultUserEntity: UserEntityDTO = {
  username: '',

  password: '',

  avatar: '',

  email: '',

  job: '',

  jobName: '',

  organization: '',

  organizationName: '',

  location: '',

  locationName: '',

  introduction: '',

  personalWebsite: '',

  phone: '',

  registrationDate: '',

  accountId: '',

  certification: 0,

  roles: [Role.User]
}
