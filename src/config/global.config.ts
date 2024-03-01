import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  mode: process.env.MODE,
  baseAppUrl: process.env.NEST_APP_URL,
  baseMongoUrl: process.env.NEST_MONGO_URL
}))
