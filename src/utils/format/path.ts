import { ConfigService } from '@nestjs/config'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { resolve } from 'url'
import * as iconv from 'iconv-lite'
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

export const splitFilenameFromUrl = (url: string) => {
  const paths = url.split('/')
  const filename = paths.pop()
  const prefixUrl = paths.join('/')
  return [filename, prefixUrl]
}

export const formatUrlAsUTF = (url: string) => {
  const [filename, prefixUrl] = splitFilenameFromUrl(url)
  const buf = Buffer.from(filename, 'binary')
  const decodedName = iconv.decode(buf, 'utf-8')
  return (`${prefixUrl}/${decodedName}`).replace('%20', ' ')
}

export const translateUrlToDiskPath = (url: string) => {
    const staticPathIndex = url.indexOf('/static/files/')

    if (staticPathIndex === -1) {
      throw new Error('Invalid url')
    }

    const relativePath = url.slice(staticPathIndex + '/static/files/'.length)
    const diskPath = join(process.cwd(), `/public/files/${relativePath}`)
    return diskPath
}
