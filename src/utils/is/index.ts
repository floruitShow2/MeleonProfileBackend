import { ConfigService } from '@nestjs/config'

export function isDev() {
  const configService = new ConfigService()
  const mode = configService.get('NEST_APP_MODE') || process.env.NEST_APP_MODE

  return mode === 'development'
}
