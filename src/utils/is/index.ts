import { ConfigService } from '@nestjs/config'
import mongoose from 'mongoose'

const _toString = Object.prototype.toString

export function isDev() {
  const configService = new ConfigService()
  const mode = configService.get('NEST_APP_MODE') || process.env.NEST_APP_MODE

  return mode === 'development'
}
export function isString(val: unknown): val is string {
  return _toString.call(val) === '[object String]'
}
export function isObjectId(obj: any): obj is mongoose.Types.ObjectId {
  return mongoose.Types.ObjectId.isValid(obj) && obj instanceof mongoose.Types.ObjectId
}
export function toObjectId(targetId: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  return isString(targetId) ? new mongoose.Types.ObjectId(targetId) : targetId
}

export function isUndefined(obj: any): obj is undefined {
  return obj === undefined
}
