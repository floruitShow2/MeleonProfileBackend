import { ConfigService } from '@nestjs/config'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { resolve } from 'url'
import { isDev } from '@/utils/is'

/**
 * @description 生成并返回文件存储路径，并创建响应的文件目录
 * @param path
 * @returns
 */
export const genStoragePath = (path: string): { diskPath: string; storagePath: string } => {
  const configService = new ConfigService()
  // url.resolve
  const storagePath = resolve(
    isDev() ? configService.get('NEST_APP_URL') : process.cwd(),
    `/static/files/${path}`
  ).replace('%20', ' ')
  // path.join
  const diskPath = join(process.cwd(), `/public/files/${path}`)

  if (!existsSync(diskPath)) mkdirSync(diskPath, { recursive: true })

  return {
    diskPath,
    storagePath
  }
}
