import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { resolve } from 'url'
import { isDev } from '../is'
import { ConfigService } from '@nestjs/config'

/**
 * @description 生成并返回文件存储路径，并创建响应的文件目录
 * @param path 
 * @returns 
 */
export const genStoragePath = (path: string): { diskPath: string; storagePath: string } => {
    const configService = new ConfigService()
    console.log(isDev(), configService.get('NEST_APP_URL'))
    const storagePath = resolve(
        isDev() ? configService.get('NEST_APP_URL') : process.cwd(),
        `/static/files/${path}`
    )
    const diskPath = join(
        process.cwd(),
        `/public/files/${path}`
    )
    if (!existsSync(diskPath)) mkdirSync(diskPath, { recursive: true })

    return {
        diskPath,
        storagePath
    }
}
