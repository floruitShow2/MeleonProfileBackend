import { ConfigService } from '@nestjs/config'
import { decryptPrivateInfo } from '@/utils/encrypt'
import { isDev } from '@/utils/is'

export function genMongoConnection() {
  const configService = new ConfigService()
  const host = configService.get('NEST_APP_HOST')
  const port = configService.get('NEST_MONGO_PORT')
  const user = decryptPrivateInfo(configService.get('NEST_MONGO_USER'))
  const pwd = decryptPrivateInfo(configService.get('NEST_MONGO_PWD'))

  return isDev()
    ? `mongodb://${host}:${port}/meleon`
    : `mongodb://${user}:${pwd}@${host}:${port}/meleon`
}
