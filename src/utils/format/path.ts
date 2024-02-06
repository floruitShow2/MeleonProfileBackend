import { existsSync, mkdirSync } from "fs"
import { join } from "path"

/**
 * @description 生成并返回文件存储路径，并创建响应的文件目录
 * @param path 
 * @returns 
 */
export const genStoragePath = (path: string): string => {
    const storagePath = join(
        __dirname,
        `../../../filesStorage/${path}`
    )
    if (!existsSync(storagePath)) mkdirSync(storagePath, { recursive: true })
    return storagePath
}

export const genStaticPath = (path: string) => {
    const storagePath = join(
        __dirname,
        `../../../public/${path}`
    )
    if (!existsSync(storagePath)) mkdirSync(storagePath, { recursive: true })
    return storagePath
}