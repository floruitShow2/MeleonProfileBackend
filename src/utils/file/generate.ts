import { FileTypeEnum } from '@/constants/file.enum'

const mimeTypeMap: Array<[FileTypeEnum, RegExp]> = [
    [FileTypeEnum.IMAGE, /^image\//],
    [FileTypeEnum.VIDEO, /^video\//],
    [FileTypeEnum.AUDIO, /^audio\//],
    [FileTypeEnum.FILE, /\s\S/]
]

/**
 * @description 根据 文件信息 生成 文件类型
 * @param file
 * @returns
 */
export const genFileType = (file: Express.Multer.File): FileTypeEnum | null => {
    const { mimetype } = file
    for (const [fileType, regex] of mimeTypeMap) {
        if (regex.test(mimetype)) {
            return fileType as FileTypeEnum
        }
    }
    return null
}
