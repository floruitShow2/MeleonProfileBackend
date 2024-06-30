import { ConfigService } from '@nestjs/config'
import mongoose, { ObjectId } from 'mongoose'

export function isDev() {
  const configService = new ConfigService()
  const mode = configService.get('NEST_APP_MODE') || process.env.NEST_APP_MODE

  return mode === 'development'
}
export function isObjectId(obj: any): obj is mongoose.Types.ObjectId {
  return mongoose.Types.ObjectId.isValid(obj) && obj instanceof mongoose.Types.ObjectId
}
export function isUndefined(obj: any): obj is undefined {
  return obj === undefined
}
