export interface UserSignUpDTO {
  username: string
  password: string
}
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

  role: 'admin' | 'user'
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

  role: 'user'
}
