import { FileTypeEnum } from '@/constants/file.enum'

const mimeTypeMap: Record<FileTypeEnum, RegExp> = {
    [FileTypeEnum.IMAGE]: /^image\//,
    [FileTypeEnum.PDF]: /^application\/pdf$/,
    [FileTypeEnum.Video]: /^video\//,
    [FileTypeEnum.Audio]: /^audio\//
}

/**
 * @description 根据 文件信息 生成 文件类型
 * @param file
 * @returns
 */
export const genFileType = (file: Express.Multer.File): FileTypeEnum | null => {
    const { mimetype } = file
    for (const [fileType, regex] of Object.entries(mimeTypeMap)) {
        if (regex.test(mimetype)) {
            return fileType as FileTypeEnum
        }
    }
    return null
}
