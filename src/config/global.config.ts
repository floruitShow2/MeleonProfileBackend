import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  mode: process.env.MODE,
  port: process.env.PORT,
  host: process.env.HOST,
  url: process.env.URL
}))
